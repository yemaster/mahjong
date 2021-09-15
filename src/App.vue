<template>
  <div id="app">
    <a-row :style="{ 'margin-top': '30px' }">
      <a-col :span="18" :offset="3">
        <template v-if="mahjong.roomId == ''">
          <div :style="{ 'margin-top': '10%' }">
            <span class="logo" :style="{ 'font-size': '60px' }"
              >{{ mahjong.appName }}
              <span class="sublogo">v{{ mahjong.appVersion }}</span></span
            >
            <br />
            <span>房间id</span><br />
            <form @submit="enterRoom">
              <input class="roomInput" type="number" v-model="roomId" />
            </form>
          </div>
        </template>
        <template v-else>
          <span class="logo">{{ mahjong.appName }}</span>
          <br />
          <a-tabs default-active-key="1" @change="callback">
            <a-tab-pane key="1" tab="房间">
              <template v-if="mahjong.user.status == 2">
                <template v-if="!mahjong.huPeople">
                  <a-card size="small" title="已出的牌">
                    <div v-for="(plyr, i) in mahjong.game.pt" v-bind:key="i">
                      <span>
                        PLY{{ i + 1 }}
                        <template v-if="i == mahjong.game.me">
                          (我)
                        </template> </span
                      >:
                      <a-tag
                        v-for="(j, z) in plyr"
                        v-bind:key="z"
                        :color="j >= 100 ? '#db2828' : '#ccc'"
                      >
                        {{ mahjong.cardsname[j % 100] }}
                      </a-tag>
                      <br />
                    </div>
                  </a-card>
                  <br />
                  <a-row :gutter="16">
                    <a-col :span="18">
                      <a-card size="small" title="我的牌">
                        龙：<a-tag
                          v-if="
                            mahjong.game.dragon < 0 || mahjong.game.dragon > 33
                          "
                        >
                          未知
                        </a-tag>
                        <a-tag v-else color="cyan">
                          {{ mahjong.cardsname[mahjong.game.dragon] }}
                        </a-tag>
                        <br />
                        你的牌：
                        <a-tag
                          v-for="(cd, i) in mahjong.game.cards"
                          v-bind:key="i"
                          style="cursor: pointer"
                          :color="getColor(cd, i)"
                          @click="put_card(cd.num)"
                        >
                          {{ mahjong.cardsname[cd.num] }}
                        </a-tag>
                        <a-divider />
                        <a-tag
                          v-if="mahjong.game.cards.length >= 14"
                          color="#db2828"
                        >
                          你的回合
                        </a-tag>
                        <a-tag v-else> 不是你的回合 </a-tag>
                      </a-card>
                    </a-col>
                    <a-col :span="6">
                      <a-card size="small" title="操作">
                        <a-space>
                          <a-button
                            class="ui button"
                            v-show="mahjong.canOp"
                            @click="doOp(0)"
                          >
                            取消
                          </a-button>
                          <a-button
                            type="primary"
                            class="ui primary button"
                            v-show="mahjong.canEat"
                            @click="doOp(2)"
                          >
                            吃
                          </a-button>
                          <a-button
                            type="primary"
                            class="ui green button"
                            v-show="mahjong.canPen"
                            @click="doOp(3)"
                          >
                            碰
                          </a-button>
                          <a-button
                            type="primary"
                            class="ui violet button"
                            v-show="mahjong.canGang"
                            @click="doOp(4)"
                          >
                            杠
                          </a-button>
                          <a-button
                            type="danger"
                            v-show="mahjong.canHu"
                            @click="doOp(1)"
                          >
                            胡
                          </a-button>
                        </a-space>
                      </a-card>
                    </a-col>
                  </a-row>
                </template>
                <template v-else>
                  <a-result
                    :status="mahjong.huPeople == sked.id ? 'success' : 'error'"
                    :title="
                      (mahjong.huPeople == sked.id ? '你' : mahjong.huPeople) +
                      '糊了!'
                    "
                  >
                    <template #extra>
                      <a-button type="primary" @click="quitGame">
                        离开
                      </a-button>
                    </template>
                  </a-result>
                </template>
              </template>
              <template v-else>
                <a-row :gutter="16">
                  <a-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
                    <a-card title="个人设置">
                      <a-form-model layout="vertical">
                        <a-form-model-item label="昵称">
                          <a-input
                            v-model="mahjong.user.nickname"
                            placeholder="填写自己喜欢的昵称"
                          />
                        </a-form-model-item>
                        <a-form-model-item>
                          <a-space>
                            <a-button type="primary" @click="updateMe">
                              提交
                            </a-button>
                          </a-space>
                        </a-form-model-item>
                      </a-form-model>
                    </a-card>
                    <br />
                    <a-card title="服务器设置">
                      <a-form-model layout="vertical">
                        <a-form-model-item label="服务器ip">
                          <a-input
                            v-model="systemLink"
                            placeholder="填写服务器ip地址"
                          />
                        </a-form-model-item>
                        <a-form-model-item label="Client Id">
                          <a-input
                            v-model="sked.id"
                            placeholder="Client Id"
                            disabled
                          />
                        </a-form-model-item>
                        <a-form-model-item>
                          <a-space>
                            <a-button type="primary" @click="reConnect">
                              重连
                            </a-button>
                          </a-space>
                        </a-form-model-item>
                      </a-form-model>
                    </a-card>
                  </a-col>
                  <a-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18">
                    <a-spin :spinning="mahjong.isLoading" tip="与服务器连接中">
                      <h2>在线用户{{ mahjong.onlineUsers.length }}人</h2>
                      <a-table
                        :columns="columns"
                        :data-source="mahjong.onlineUsers"
                      >
                        <span slot="status" slot-scope="status">
                          <a-tag v-if="status == 0" color="#ccc"> 空闲 </a-tag>
                          <a-tag v-else-if="status == 1" color="blue">
                            等待开始
                          </a-tag>
                          <a-tag v-else color="red"> 游戏中 </a-tag>
                        </span>
                      </a-table>
                      <a-button
                        v-if="mahjong.onlineUsers.length > 1"
                        :type="mahjong.user.status != 0 ? 'primary' : 'default'"
                        @click="changeStatus"
                        >强制开始 {{ forcedUsers }} /
                        {{ mahjong.onlineUsers.length }}</a-button
                      >
                    </a-spin>
                  </a-col>
                </a-row>
              </template>
            </a-tab-pane>
            <a-tab-pane key="3" tab="帮助" force-render>
              <h1>帮助</h1>
              <br />
            </a-tab-pane>
            <a-tab-pane key="4" tab="关于">
              <h1>关于{{ mahjong.appName }} v{{ mahjong.appVersion }}</h1>
              <a-divider />
              由yemaster团结广大人民群众合作开发编写。
            </a-tab-pane>
          </a-tabs>
        </template>
        <a-divider />
        {{ mahjong.appName }} v{{ mahjong.appVersion }} By yemaster.
      </a-col>
    </a-row>
  </div>
</template>

<style>
.logo {
  font-size: 35px;
  font-weight: 300;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 300;
}
.sublogo {
  font-size: 35px;
  font-weight: 300;
}
.roomInput {
  font-size: 27px;
  outline: none;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #aaa;
  width: 61.8%;
  transition: all 0.3s;
}
.roomInput:hover,
.roomInput:focus {
  border-color: #179aff;
}
.ant-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}
.ant-card:hover {
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}
</style>

<script>
import { Row, Col } from "ant-design-vue/lib/grid";
import Button from "ant-design-vue/lib/button";
import Tabs from "ant-design-vue/lib/tabs";
import message from "ant-design-vue/lib/message";
import FormModel from "ant-design-vue/lib/form-model";
import Input from "ant-design-vue/lib/input";
import Card from "ant-design-vue/lib/card";
import Table from "ant-design-vue/lib/table";
import Tag from "ant-design-vue/lib/tag";
import Divider from "ant-design-vue/lib/divider";
import Result from "ant-design-vue/lib/result";
import Space from "ant-design-vue/lib/space";
import Spin from "ant-design-vue/lib/spin";
import io from "socket.io-client";

const columns = [
  {
    title: "昵称",
    dataIndex: "nickname",
    key: "nickname",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    scopedSlots: { customRender: "status" },
  },
];

export default {
  name: "App",
  data() {
    return {
      mahjong: {
        appName: "Mahjong",
        appVersion: "2.0.2",
        roomId: "",
        user: {
          nickname: "匿名",
          status: 0,
        },
        onlineUsers: [],
        game: {
          cards: [],
          dragon: -1,
          pt: [[], [], [], []],
          me: -1,
        },
        chats: [],
        chatMessage: "",
        isLoading: true,
        canOp: 0,
        canEat: 0,
        canPen: 0,
        canGang: 0,
        canHu: 0,
        systemLink: "http://localhost:3000",
        huPeople: "",
        allShow: {},
        cardsname: [
          "1万",
          "2万",
          "3万",
          "4万",
          "5万",
          "6万",
          "7万",
          "8万",
          "9万",
          "1筒",
          "2筒",
          "3筒",
          "4筒",
          "5筒",
          "6筒",
          "7筒",
          "8筒",
          "9筒",
          "1条",
          "2条",
          "3条",
          "4条",
          "5条",
          "6条",
          "7条",
          "8条",
          "9条",
          "东",
          "南",
          "西",
          "北",
          "中",
          "发",
          "白",
        ],
      },
      roomId: "",
      sked: {
        io: {
          uri: "2333",
        },
        id: "Unknown",
      },
      columns,
    };
  },
  mounted() {
    const _t = this;
    _t.systemLink = location.origin;
    if (location.pathname.match(/\/room\/(.*)/) != null) {
      _t.mahjong.roomId = location.pathname.match(/\/room\/(.*)/)[1];
      _t.reConnect();
      if (localStorage.mnick != undefined)
        _t.mahjong.user.nickname = localStorage.mnick;
    }
  },
  computed: {
    forcedUsers() {
      let ret = 0;
      for (let i in this.mahjong.onlineUsers) {
        if (this.mahjong.onlineUsers[i].status == 1) ret++;
      }
      return ret;
    },
  },
  methods: {
    callback(key) {
      console.log(key);
    },
    enterRoom(e) {
      if (
        Math.floor(Number(this.roomId)) <= 0 ||
        Math.floor(Number(this.roomId)) > 10000
      )
        this.roomId = Math.random() * 10000 + 1 + [];
      this.roomId = Math.floor(Number(this.roomId)) + [];
      location.href = "/room/" + this.roomId;
      e.preventDefault();
    },
    updateMe() {
      localStorage.mnick = this.mahjong.user.nickname;
      this.sked.emit("updateUser", {
        user: this.mahjong.user,
        room: this.mahjong.roomId,
      });
    },
    getColor(cd, i) {
      if (
        cd.num == this.mahjong.game.dragon &&
        i != this.mahjong.game.cards.length - 1
      )
        return "#db2828";
      else if (
        i == this.mahjong.game.cards.length - 1 &&
        this.mahjong.game.cards.length >= 14
      )
        return "#47af50";
      else if (cd.type != 0) return "#ccc";
      else return "#108ee9";
    },
    changeStatus() {
      this.mahjong.game = {
        cards: [],
        dragon: -1,
        pt: [[], [], [], []],
        me: -1,
      };
      this.mahjong.huPeople = "";
      this.mahjong.canEat = 0;
      this.mahjong.canGang = 0;
      this.mahjong.canOp = 0;
      this.mahjong.canGang = 0;
      this.mahjong.canPen = 0;
      this.mahjong.user.status = 1 - this.mahjong.user.status;
      this.sked.emit("updateUser", {
        user: this.mahjong.user,
        room: this.mahjong.roomId,
      });
    },
    put_card(e) {
      let _t = this;
      _t.sked.emit("put_cards", {
        card: e,
      });
    },
    doOp(e) {
      const _t = this;
      _t.sked.emit("do_operation", {
        type: e,
      });
    },
    quitGame() {
      this.mahjong.user.status = 0;
      this.sked.emit("updateUser", {
        user: this.mahjong.user,
        room: this.mahjong.roomId,
      });
    },
    reConnect() {
      const _t = this;
      if (typeof _t.sked.close == "function") _t.sked.close();
      _t.sked = io(_t.systemLink);
      _t.sked.on("connect", () => {
        message.success("成功连接至服务器");
        _t.mahjong.isLoading = false;
        _t.updateMe();
      });
      _t.sked.on("disconnect", () => {
        message.error("你从服务器断开了");
        _t.mahjong.isLoading = true;
        _t.mahjong.game = {
          cards: [],
          dragon: -1,
          pt: [[], [], [], []],
          me: -1,
        };
        _t.mahjong.huPeople = "";
        _t.mahjong.canEat = 0;
        _t.mahjong.canGang = 0;
        _t.mahjong.canOp = 0;
        _t.mahjong.canGang = 0;
        _t.mahjong.canPen = 0;
      });
      _t.sked.on("message", (data) => {
        if (data.class == "success") message.success(data.mes);
        else if (data.class == "error") message.error(data.mes);
        else if (data.class == "warning") message.warning(data.mes);
        else if (data.class == "info") message.info(data.mes);
      });
      _t.sked.on("updateOnlineUsers", (data) => {
        _t.mahjong.onlineUsers = data.onlineUsers[_t.mahjong.roomId];
        let cnt = 0;
        for (let i in _t.mahjong.onlineUsers) {
          if (_t.mahjong.onlineUsers[i].clientId == _t.sked.id) {
            _t.mahjong.user.status = _t.mahjong.onlineUsers[i].status;
            _t.mahjong.game.me = cnt;
          }
          ++cnt;
        }
      });
      _t.sked.on("available_operation", (data) => {
        _t.mahjong.canOp = data.op;
        _t.mahjong.canHu = data.hu == -1 ? false : true;
        _t.mahjong.canEat = data.eat == -1 ? false : true;
        _t.mahjong.canPen = data.pen == -1 ? false : true;
        _t.mahjong.canGang = data.gang == -1 ? false : true;
      });
      _t.sked.on("init_cards", (data) => {
        _t.mahjong.game.cards = data.mycards;
      });
      _t.sked.on("get_dragon", (data) => {
        _t.mahjong.game.dragon = data.dragon;
      });
      _t.sked.on("new_put_cards", (data) => {
        let olu = _t.mahjong.onlineUsers;
        let cp = -1;
        let cnt = 0;
        for (let i in olu) {
          if (olu[i].clientId == data.cid) cp = cnt;
          ++cnt;
        }
        if (cp == -1) {
          message.error("致命错误：cid未找到");
          return;
        }
        if (typeof _t.mahjong.game.pt[cp] != "object")
          _t.mahjong.game.pt[cp] = [];
        for (let i in _t.mahjong.game.pt)
          for (let j in _t.mahjong.game.pt[i]) _t.mahjong.game.pt[i][j] %= 100;
        _t.mahjong.game.pt[cp].push(data.new_put_cards + 100);
      });
      _t.sked.on("someone_hu", (data) => {
        //alert(data.hu + '糊了！')
        //console.log(data.all)
        //_t.user.status = 0
        //_t.updateMe()
        _t.mahjong.huPeople = data.hu;
        _t.mahjong.allShow = data.all;
      });
    },
  },
  components: {
    ARow: Row,
    ACol: Col,
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    AInput: Input,
    ACard: Card,
    ATable: Table,
    ATag: Tag,
    ASpace: Space,
    ADivider: Divider,
    AResult: Result,
    ASpin: Spin,
  },
};
</script>
