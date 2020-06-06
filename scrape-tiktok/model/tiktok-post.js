const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tiktokPostSchema = new Schema({
  _id: {
    type: "String",
  },
  element: {
    id: {
      type: "String",
    },
    text: {
      type: "String",
    },
    createTime: {
      type: "String",
    },
    authorMeta: {
      id: {
        type: "String",
      },
      name: {
        type: "String",
      },
      nickName: {
        type: "String",
      },
      following: {
        $numberInt: {
          type: "String",
        },
      },
      fans: {
        $numberInt: {
          type: "String",
        },
      },
      heart: {
        type: "String",
      },
      video: {
        $numberInt: {
          type: "Date",
        },
      },
      digg: {
        $numberInt: {
          type: "Date",
        },
      },
      verified: {
        type: "Boolean",
      },
      private: {
        type: "Boolean",
      },
      signature: {
        type: "String",
      },
      avatar: {
        type: "String",
      },
    },
    musicMeta: {
      musicId: {
        type: "String",
      },
      musicName: {
        type: "String",
      },
      musicAuthor: {
        type: "String",
      },
      musicOriginal: {
        type: "String",
      },
      playUrl: {
        type: "String",
      },
    },
    covers: {
      default: {
        type: "String",
      },
      origin: {
        type: "String",
      },
      dynamic: {
        type: "String",
      },
    },
    imageUrl: {
      type: "String",
    },
    webVideoUrl: {
      type: "String",
    },
    videoUrl: {
      type: "String",
    },
    videoUrlNoWaterMark: {
      type: "String",
    },
    videoMeta: {
      width: {
        $numberInt: {
          type: "Date",
        },
      },
      height: {
        $numberInt: {
          type: "Date",
        },
      },
      ratio: {
        $numberInt: {
          type: "Date",
        },
      },
      duration: {
        $numberInt: {
          type: "Date",
        },
      },
    },
    diggCount: {
      $numberInt: {
        type: "String",
      },
    },
    shareCount: {
      $numberInt: {
        type: "Date",
      },
    },
    playCount: {
      $numberInt: {
        type: "String",
      },
    },
    commentCount: {
      $numberInt: {
        type: "Date",
      },
    },
    downloaded: {
      type: "Boolean",
    },
    hashtags: {
      type: ["Mixed"],
    },
  },
});

module.exports = mongoose.model("TiktokPost", tiktokPostSchema);
