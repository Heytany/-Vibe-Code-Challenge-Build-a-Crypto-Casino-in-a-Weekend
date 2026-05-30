<script setup lang="ts">
/**
 * @agent-context Unknown routes → branded access denied (same as error.vue).
 */
throw createError({
  statusCode: 404,
  statusMessage: 'Not Found',
  fatal: true,
})
</script>
