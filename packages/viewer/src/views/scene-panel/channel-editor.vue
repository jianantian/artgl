<template>
  <div class="channel">
    <button @click="uploadImg">upload</button>
    <button @click="deleteChannel">deleteChannel</button>
    {{name}}
    <div class="img"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { loadImageFromFile } from "artgl";
import { Texture } from "artgl/";

@Component
export default class ChannelEditor extends Vue {
  @Prop() name!: string;
  @Prop() texture!: Texture;

  src: any;

  mounted(){
    console.log('m')// ?
    if(this.texture.rawDataSource.source instanceof HTMLImageElement){
      this.refreshDomImg(this.texture.rawDataSource.source)
    }
  }

  refreshDomImg(img: HTMLImageElement){
    const appendImg = this.$el.querySelector('.channel-img')
    if(appendImg != null){
      appendImg.parentNode!.removeChild(appendImg)
    }
    img.className = 'channel-img'
    this.$el.querySelector('.img')!.appendChild(img);
    (img as any).style =`
    width:100%; height:100%;
    `
  }

  deleteChannel = () => {
    this.$emit('deleteSelf', this.name);
  }

  uploadImg = async () => {
    const img = await loadImageFromFile()
    this.refreshDomImg(img)
    this.$emit('uploadImage', this.name, img)
  }
}

</script>

<style lang="scss" scoped>
.channel{
  background: #eee;
  margin: 4px;
  border-radius: 3px;
}

.img{
  width: 150px;
  height: 150px;
  margin: 2px;
  border-radius: 3px;
  overflow: hidden;
}

</style>