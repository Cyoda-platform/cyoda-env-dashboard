import {ref} from 'vue';

export function useHoverWithActiveLinkMixin(activeRelation, isOpen) {
  const isHoverWithActiveLink = ref(false);
  const isHoverWithActiveLinkTimeoutId = ref(null);

  const startHoverWithActiveLink = () => {
    if (activeRelation.value && !isOpen.value) {
      if (isHoverWithActiveLinkTimeoutId.value) clearTimeout(isHoverWithActiveLinkTimeoutId.value);
      isHoverWithActiveLinkTimeoutId.value = setTimeout(() => {
        isHoverWithActiveLink.value = true;
        setTimeout(() => {
          isOpen.value = true;
          isHoverWithActiveLink.value = false;
        }, 300);
      }, 1500);
    }
  }

  const stopHoverWithActiveLink = () => {
    isHoverWithActiveLink.value = false;
    if (isHoverWithActiveLinkTimeoutId.value) clearTimeout(isHoverWithActiveLinkTimeoutId.value);
    isHoverWithActiveLinkTimeoutId.value = null;
  }

  return {
    isHoverWithActiveLink,
    isHoverWithActiveLinkTimeoutId,
    stopHoverWithActiveLink,
    startHoverWithActiveLink
  }
}
