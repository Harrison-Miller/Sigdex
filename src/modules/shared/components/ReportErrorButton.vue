<template>
  <button
    class="report-error-btn"
    :aria-label="`Report error for ${unitName || 'unit'} in ${armyName}`"
    @click="openForm"
  >
    <FontAwesomeIcon icon="circle-exclamation" />
    Report Error
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { SIGDEX_VERSION } from '../../../version';

const props = defineProps<{
  unitName?: string;
  armyName: string;
  armyRevision: string;
}>();

const FORM_ID = '1FAIpQLSfqKoc-uKZ7Smp4y9muwvMQ6vGULPFVBnm-upIK5wRZgnXy6w';
const GOOGLE_FORM_BASE = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform`;
const UNIT_NAME_FIELD = 'entry.1758436008';
const ARMY_NAME_FIELD = 'entry.1736572556';
const ARMY_REVISION_FIELD = 'entry.142563691';
const APP_VERSION_FIELD = 'entry.1167406783';

const formLink = computed(() => {
  const params = new URLSearchParams({
    [ARMY_NAME_FIELD]: props.armyName,
    [ARMY_REVISION_FIELD]: props.armyRevision,
    [APP_VERSION_FIELD]: SIGDEX_VERSION,
    ...(props.unitName ? { [UNIT_NAME_FIELD]: props.unitName } : {}),
  });
  return `${GOOGLE_FORM_BASE}?${params.toString()}`;
});

function openForm() {
  window.open(formLink.value, '_blank');
}
</script>

<style scoped>
.report-error-btn {
  background: var(--color-red);
  color: #fff;
  border: none;
  border-radius: 2rem;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  font-weight: bold;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: background 0.2s;
}
.report-error-btn:hover {
  background: #c00;
}
</style>
