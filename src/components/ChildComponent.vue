<template>
  <div class="test">
    <span>{{name}}</span>
  </div>
</template>
<script>
  export default {
    name: 'child',
    data () {
      return {
        name: 'Zhanglh'
      };
    },
    render(e){
    }
  };
</script>
<style scoped>
  .test {
    height: 24px;
    width: 120px;
  }
</style>
