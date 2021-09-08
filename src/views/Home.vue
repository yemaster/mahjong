<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card class="box-card">
        <div class="text item">
          <el-form ref="form" :model="user" label-position="top" label-width="80px">
            <el-form-item label="房间">
              <el-input v-model="user.room"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="user.nickname"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateMe">修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card class="box-card">
        <div class="text item">2333</div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      user: {
        room: 2333,
        nickname: "匿名",
        status: 0,
      },
    };
  },
  methods: {
    updateMe() {
      const _t = this;
      _t.$socket.emit("updateUser", {
          room: _t.user.room,
          user: _t.user
      })
    }
  },
  sockets: {
    connect() {
      // Connected
      const _t = this;
      _t.$socket.emit("updateUser", {
          room: _t.user.room,
          user: _t.user
      })
    },
    disconnect() {
      console.log("断开连接");
    },
    reconnect() {
      console.log("重新连接");
    },
    message: (data) => {
      this.$message({
        message: data.mes,
        type: data.class,
      });
    },
  },
};
</script>
