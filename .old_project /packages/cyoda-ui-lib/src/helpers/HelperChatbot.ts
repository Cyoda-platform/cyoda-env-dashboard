import {ref, watch} from 'vue';

export function outputResponse({text: response, immediate = false}, isLoading) {
  const result = ref("");
  const ready = ref(false);
  const cancelled = ref(false);
  if (immediate) {
    result.value = response;
    ready.value = true;
  } else {
    runWorker(response, isLoading, result, ready, cancelled);

    watch(cancelled, (value) => {
      if (value) ready.value = false;
    })
  }
  return {result, ready};
}

async function runWorker(response, isLoading, result, ready, cancelled) {
  const parts = response.split(" ");
  let i = 0;
  for (let i = 0; i < parts.length; i++) {
    // if (!isLoading.value) {
    //   cancelled.value = true;
    //   break;
    // }
    const part = await runTimeOut(parts[i]);
    if (part) result.value += part;
  }
  ready.value = true;
}

function runTimeOut(value: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(` ${value}`);
    }, Math.floor(Math.random() * 50) + 5);
  })
}

export function handlerError(e, element) {
  if (e.message === 'canceled') {
    element.repeats.push([{
      type: 'text',
      text: 'The request was canceled',
    }])
    return;
  }
  element.repeats.push([{
    type: 'text',
    text: 'Request returned an error. Please try again',
  }])
}

