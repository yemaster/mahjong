<template>
  <el-menu
    class="el-menu-demo"
    mode="horizontal"
    :router="true"
    @select="handleSelect"
  >
    <div class="logo">
      <span>Mahjong</span>
    </div>
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/room">房间</el-menu-item>
  </el-menu>
</template>

<style scoped>
.logo {
  margin-left: 2%;
  margin-right: 2%;
  font-size: 20px;
  float: left;
  line-height: 60px;
}
</style>

<script>
export default {
  name: "Menu",
  methods: {
    handleSelect() {},
  },
};
</script>
