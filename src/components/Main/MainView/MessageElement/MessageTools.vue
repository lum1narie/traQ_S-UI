<template>
  <div :class="$style.container">
    <template v-if="showQuickReaction || !isMobile">
      <stamp
        v-for="stamp in recentStamps"
        :key="stamp"
        :stamp-id="stamp"
        @click.native="addStamp(stamp)"
        :size="28"
        :class="$style.stampListItem"
      />
      <span :class="$style.line"></span>
      <icon
        v-if="isMobile"
        mdi
        name="chevron-right"
        :size="28"
        :class="$style.icon"
        @click="toggleQuickReaction"
      />
    </template>
    <icon
      v-else
      mdi
      name="chevron-left"
      :size="28"
      :class="$style.icon"
      @click="toggleQuickReaction"
    />
    <icon
      mdi
      name="emoticon-outline"
      :size="28"
      :class="$style.icon"
      @click="onStampIconClick"
    />
    <icon
      :class="$style.icon"
      :size="28"
      mdi
      name="dots-horizontal"
      @click="onDotsClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from '@vue/composition-api'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import { targetPortalName } from '@/views/Main.vue'
import useIsMobile from '@/use/isMobile'

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const recentStamps = computed(() =>
      store.getters.domain.me.recentStampIds.slice(0, 3)
    )
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
    }

    const { invokeStampPicker } = useStampPickerInvoker(
      targetPortalName,
      stampData => {
        addStamp(stampData.id)
      }
    )
    const onStampIconClick = (e: MouseEvent) => {
      if (store.getters.ui.stampPicker.isStampPickerShown) {
        store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        invokeStampPicker({ x: e.pageX, y: e.pageY })
      }
    }

    const onDotsClick = (e: MouseEvent) => {
      store.dispatch.ui.messageContextMenu.openMessageContextMenu({
        messageId: props.messageId,
        x: e.pageX,
        y: e.pageY
      })
    }

    const { isMobile } = useIsMobile()
    const showQuickReaction = ref(!isMobile.value)
    const toggleQuickReaction = () =>
      (showQuickReaction.value = !showQuickReaction.value)

    return {
      recentStamps,
      addStamp,
      onDotsClick,
      onStampIconClick,
      isMobile,
      showQuickReaction,
      toggleQuickReaction
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-tertiary;
  border-radius: 4px;
  border: solid 2px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px 0;
  justify-content: space-between;
  contain: content;
}

.line {
  border-left: solid 2px;
  height: 20px;
  margin: 0 4px;
}

.icon {
  display: block;
  padding: 4px;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}

.stampListItem {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  &:hover {
    @include background-secondary;
  }
}
</style>
