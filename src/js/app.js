App = {
  web3Provider: null,
  contracts: {},
  account: null,
  noteIntance: null,//拿到合约的示例
  noteLength : 0,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }

    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    var account = App.getAccountParam();

    if (null == account)  {
      console.log("initAccount");
      App.initAccount();
    } else {
      App.account = account;
      console.log("account:" + account);
    }

    return App.initContract();
  },

  initAccount: function() {
    web3.eth.getAccounts(function(error, accounts) {
      App.account = accounts[0];
      console.log(App.account);
    });
  },

  initContract: function() {
    $.getJSON('CarContract.json', function(data) {
      App.contracts.noteContract = TruffleContract(data);
      App.contracts.noteContract.setProvider(App.web3Provider);

      App.contracts.noteContract.deployed().then(function(instance) {
        App.noteIntance = instance;
        return App.getCarInfo();
      });

    });

    return App.bindEvents();
  },

  getCarInfo: function() {
    App.noteIntance.getCarInfoLen(App.account).then(function(len) {
      $("#account").html("<b>一共有<b>"+len+"<b>条任务</b>");
      App.noteLength = len;
      if (len > 0) {
        App.loadCarInfo( len - 1);
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  adjustHeight: function() {
    console.log("reset height");  
    $('textarea').each(function () {
      console.log("reset height");
           this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        })
  },

  //这个地方实现出来,index = 1,将自己申请的显示出来，现在的问题是这个数据有没有保存在区块链上，别人怎么去获得这个数据的。
  //显示效果，_name,_description,_reward,_waitTime,_longitude,_latitude)
  loadCarInfo: function(index) {
    App.noteIntance.CarInfos(App.account, index).then(function(CarInfo) {
      $(".list-group").append(
          '<a href="#" class="list-group-item" style="margin-top: 20px"> ' +
            '<span class="list-group-item-text"> 合约名字:' +CarInfo[0]+
              '</span>' +
          '<span class="list-group-item-text"> 合约描述:' +CarInfo[1]+
          '</span>' +
          '<span class="list-group-item-text"> 合约奖励:' +CarInfo[2]+
          '</span>' +
          '</br>'+
          '<span class="list-group-item-text"> 等待时间:' +CarInfo[3]+
          '</span>' +
          '<span class="list-group-item-text"> 车辆经度:' +CarInfo[4]+
          '</span>' +
          '<span class="list-group-item-text"> 车辆维度:' +CarInfo[5]+
          '</span>' +
           '</a>');
      if (index -1 >= 0) {
        //通过递归做出来
        App.loadCarInfo(index - 1);
      } else {
        App.adjustHeight();
      }
    } ).catch(function(err) {
      console.log(err.message);
    });

  },

  //绑定事件
  bindEvents: function() {
    $("#publishTask").on('click', function() {
      console.log(" click ");
      $("#loader").show();

      App.noteIntance.addCarInfo($("#name").val(),$("#description").val(),$("#reward").val(),$("#waitTime").val(),$("#longitude").val(),$("#latitude").val()).then(function(result) {
         return App.watchChange();
      }).catch(function (err) {
        console.log(err.message);
      });
    });

    $("#notes").on('click', "button", function() {
      var cindex = $(this).attr("index");
      var noteid = "#note" + cindex
      var note = $(noteid).val();
      console.log(note);

      
      App.noteIntance.modifyNote(App.account, cindex, note).then(
        function(result) {
          return App.getNotes();
        }
      ); 
    });
  },

  //事件监听
  watchChange: function() {
      var infoEvent = App.noteIntance.NewCarInfo();
      //点击增加的时候就会触发 notes[address] = string 但是这个有没有加入到区块链呢？ 然后读取这个/
      return infoEvent.watch(function (err, result) {
        console.log("reload");
        //重新加载页面
        window.location.reload();
      });
  }, 

  getAccountParam: function() {
    var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});