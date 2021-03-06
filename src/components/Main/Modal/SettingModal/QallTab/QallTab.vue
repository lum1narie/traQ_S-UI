<template>
  <section>
    <div :class="$style.element">
      <div :class="$style.enable">
        <h3>RTC機能を有効にする (β)</h3>
        <toggle
          @input="state.isEnabled = !state.isEnabled"
          :enabled="state.isEnabled"
          :class="$style.toggle"
        />
      </div>
      <p :class="$style.content">
        通話などのリアルタイムコミュニケーション機能を有効化します<br />
        マイクなどへのアクセス許可が必要です
      </p>
    </div>
    <div v-if="rtcSettings.isEnabled" :class="$style.element">
      <h3>入力デバイス</h3>
      <div :class="$style.content">
        <form-selector
          v-if="!fetchFailed && audioInputDevices.length > 0"
          v-model="state.audioInputDeviceId"
          :options="audioInputDeviceOptions"
        />
        <p v-else>
          デバイスが取得できませんでした
        </p>
      </div>
    </div>
    <div v-if="rtcSettings.isEnabled" :class="$style.element">
      <div :class="$style.enable">
        <h3>メッセージの読み上げ</h3>
        <toggle
          @input="state.isTtsEnabled = !state.isTtsEnabled"
          :enabled="state.isTtsEnabled"
          :class="$style.toggle"
        />
      </div>
      <p :class="$style.content">
        Qallしているチャンネルに投稿されたメッセージを読み上げます
      </p>
    </div>
    <div v-if="rtcSettings.isTtsEnabled" :class="$style.element">
      <h3>メッセージ読み上げの声</h3>
      <div :class="$style.content">
        <form-selector
          v-if="voiceOptions.length > 0"
          v-model="state.voiceName"
          :options="voiceOptions"
        />
        <p v-else>
          読み上げ音声の声の種類が取得できませんでした
        </p>
        <form-input
          label="ピッチ"
          type="number"
          step="0.1"
          v-model.number="state.voicePitch"
        />
        <form-input
          label="速度"
          type="number"
          step="0.1"
          v-model.number="state.voiceRate"
        />
        <form-input
          label="音量"
          type="number"
          step="0.1"
          v-model.number="state.voiceVolume"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watchEffect
} from '@vue/composition-api'
import store from '@/store'
import useSyncedState from '../use/syncedState'
import Toggle from '@/components/UI/Toggle.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormInput from '@/components/UI/FormInput.vue'

const useDevicesInfo = (state: {
  isEnabled: boolean
  audioInputDeviceId: string
}) => {
  const devices = ref<MediaDeviceInfo[]>([])
  const fetchFailed = ref(false)

  const fetchDeviceList = async () => {
    try {
      devices.value = await navigator.mediaDevices.enumerateDevices()
    } catch (e) {
      fetchFailed.value = true
    }
    if (devices.value.length === 0 || devices.value[0].label === '') {
      fetchFailed.value = true
    }
  }

  if (state.isEnabled) {
    fetchDeviceList()
  }

  watchEffect(async () => {
    if (state.isEnabled) {
      // offからonになったときは許可を求める
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await fetchDeviceList()

      const isAlreadySet = audioInputDevices.value.some(
        d => d.deviceId === state.audioInputDeviceId
      )
      if (isAlreadySet) return

      // デフォルトをセットする
      if (audioInputDevices.value.length > 0) {
        state.audioInputDeviceId = audioInputDevices.value[0]?.deviceId
      }
    }
  })

  const audioInputDevices = computed(() =>
    devices.value.filter(d => d.kind === 'audioinput')
  )
  const audioOutputDevices = computed(() =>
    devices.value.filter(d => d.kind === 'audiooutput')
  )
  const videoInputDevices = computed(() =>
    devices.value.filter(d => d.kind === 'videoinput')
  )

  return {
    devices,
    fetchFailed,
    audioInputDevices,
    audioOutputDevices,
    videoInputDevices
  }
}

const useVoices = (state: { isTtsEnabled: boolean; voiceName: string }) => {
  const getVoicesAndSetDefault = () => {
    const voices = speechSynthesis.getVoices().filter(v => v.lang === 'ja-JP')

    const isAlreadySet = voices.some(v => v.name === state.voiceName)
    if (!isAlreadySet) {
      // デフォルトをセットする
      const defaultVoice = voices.find(v => v.default) || voices[0]
      if (defaultVoice) {
        state.voiceName = defaultVoice.name
      }
    }

    return voices
  }

  const voices = ref(getVoicesAndSetDefault())
  const voiceOptions = computed(() =>
    voices.value.map(v => ({
      key: `${v.name} (${v.lang})`,
      value: v.name
    }))
  )

  speechSynthesis.addEventListener('voiceschanged', () => {
    voices.value = getVoicesAndSetDefault()
  })

  watchEffect(() => {
    if (!state.isTtsEnabled) {
      speechSynthesis.cancel()
    }
  })

  return voiceOptions
}

export default defineComponent({
  name: 'QallTab',
  setup() {
    const rtcSettings = computed(() => store.state.app.rtcSettings)
    const { state } = useSyncedState(
      rtcSettings,
      store.commit.app.rtcSettings.set
    )

    const devicesInfo = useDevicesInfo(state)

    const audioInputDeviceOptions = computed(() =>
      devicesInfo.audioInputDevices.value.map(d => ({
        key: d.label,
        value: d.deviceId
      }))
    )

    const voiceOptions = useVoices(state)

    return {
      rtcSettings,
      state,
      ...devicesInfo,
      audioInputDeviceOptions,
      voiceOptions
    }
  },
  components: {
    Toggle,
    FormSelector,
    FormInput
  }
})
</script>

<style lang="scss" module>
h3 {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
.enable {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    margin: 0;
  }
  .toggle {
    margin-left: 12px;
  }
}
</style>
