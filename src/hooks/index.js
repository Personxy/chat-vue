import { ref, onMounted, onUnmounted } from "vue";

export function useWindowSize() {
  const size = ref({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const onResize = () => {
    size.value.width = window.innerWidth;
    size.value.height = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener("resize", onResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
  });

  return size;
}
export const MOBILE_MAX_WIDTH = 600;

export function useMobileScreen() {
  const size = useWindowSize();

  const isMobile = computed(() => size.value.width <= MOBILE_MAX_WIDTH);

  return isMobile;
}
