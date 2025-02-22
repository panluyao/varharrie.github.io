<template>
  <main w:p="x-8 y-12">
    <article>
      <template v-if="articleLoading || !article">
        <h2 class="skeleton" w:h="!8" w:w="1/3" />
        <ul w:m="t-8" w:space="y-4">
          <li class="skeleton" w:w="1/2" w:m="b-10" />
          <li class="skeleton" w:w="full" />
          <li class="skeleton" w:w="4/5" />
          <li class="skeleton" w:w="full" />
          <li class="skeleton" w:w="3/5" />
          <li class="skeleton" w:w="full" w:h="!50" />
          <li class="skeleton" w:w="4/5" />
          <li class="skeleton" w:w="full" />
          <li class="skeleton" w:w="3/5" />
          <li class="skeleton" w:w="full" />
          <li class="skeleton" w:w="2/5" />
        </ul>
      </template>
      <template v-else-if="article">
        <h2 w:text="2xl gray-700 dark:gray-300">{{ article.title }}</h2>
        <div
          w:m="t-4"
          w:display="flex"
          w:flex="wrap"
          w:align="center"
          w:space="x-4"
          w:text="sm gray-400"
        >
          <span>
            {{ format(new Date(article.createdAt), 'dd / MM / yyyy') }}
          </span>
          <ul w:display="flex" w:align="center">
            <label-item
              v-for="label of article.labels"
              :key="label.id"
              :label="label"
              :get-link="getLabelLink"
            />
          </ul>
          <span>
            <icon-comments w:font="leading-0" w:text="top" />
            <span w:m="l-1">{{ article.comments }}</span>
          </span>
        </div>
        <markdown-html v-if="article" w:m="t-8" :markdown="article.body" playground />
      </template>
    </article>

    <section>
      <h2></h2>
      <ul v-if="commentsLoading">
        <comment-ghost-item v-for="i of 5" :key="i" />
      </ul>
      <ul v-else>
        <comment-item
          v-for="comment of comments"
          :key="comment.id"
          :comment="comment"
          :get-link="getCommentLink"
        />
      </ul>
      <div w:m="t-8" w:display="flex" w:justify="center">
        <pagination :page="page" :page-size="pageSize" :total="total" @change="onPageChange" />
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import IconComments from 'virtual:vite-icons/ri/chat-2-line';

import github from '~/services/github';
import ArticleModel from '~/models/ArticleModel';
import CommentModel from '~/models/CommentModel';
import useHandling from '~/composition/use-handling';
import MarkdownHtml from '~/components/MarkdownHtml.vue';
import Pagination from '~/components/Pagination.vue';
import CommentGhostItem from '~/components/CommentGhostItem.vue';
import CommentItem from '~/components/CommentItem.vue';
import LabelItem from '~/components/LabelItem.vue';

const route = useRoute();
const router = useRouter();

const id = computed(() => parseInt(route.params.id as string, 10) || 0);
const page = computed(() => parseInt(route.query.page as string, 10) || 1);
const pageSize = ref(30);

const article = ref<ArticleModel>();
const comments = ref<CommentModel[]>([]);

const total = computed(() => article.value?.comments ?? 0);

const [articleLoading, loadArticle] = useHandling(async () => {
  const result = await github.getIssue(id.value);
  article.value = ArticleModel.from(result);
}, true);

const [commentsLoading, loadComments] = useHandling(async () => {
  const result = await github.listComments({
    issue: id.value,
    page: page.value,
    pageSize: pageSize.value,
  });

  comments.value = result.map(CommentModel.from);
}, true);

watch(id, () => loadArticle(), { immediate: true, flush: 'post' });
watch(page, () => loadComments(), { immediate: true, flush: 'post' });

const onPageChange = (page: number) => router.push({ query: { page } });

const getLabelLink = (label: string) => ({ name: 'posts', query: { label, page: 1 } });

const getCommentLink = (id: number) => `${route.path}#comment-${id}`;

watch(commentsLoading, async () => {
  if (comments.value && route.hash) {
    await nextTick();
    const el = document.querySelector(route.hash);
    el?.scrollIntoView();
  }
});
</script>
