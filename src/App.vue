<template>
  <div id="app">
    <el-container>
      <el-header>
        <Menu />
      </el-header>
      <el-main> <router-view /></el-main>
    </el-container>
  </div>
</template>

<style scoped>
html,
body {
  margin: 0px;
}
</style>

<script>
import Menu from "./components/Menu.vue";

export default {
  name: "App",
  components: {
    Menu,
  },
};
</script>
