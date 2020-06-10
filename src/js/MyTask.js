var taskListInfo = avalon.define({
    $id: "taskList",
    data: []
})

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    web3.eth.defaultAccount = localStorage.getItem("defaultAccount");
}

console.log("web3.eth.defaultAccount:"+web3.eth.defaultAccount);


var taskManagement = web3.eth.contract(JSON.parse(TaskManagement.abi));
var taskManagementContract = taskManagement.at(TaskManagerment.address);


//这是搜集所有 的意思吗
var taskList = taskManagementContract.taskList({}, {fromBlock: 0, toBlock: 'latest'});

taskList.watch(function(error, result){
    //这个result是我watch到的数组，但是我还是不知道这个result的意思
    if(!error){
        var task_info = {"status":0,"contract":result.args.contra,"name":result.args.taskName,"description":result.args.taskDescrip,"requester":0,"abi":result.args.taskabi};
        taskManagementContract.states(task_info.contract,function(err,res){
            //这个函数的意思是传入的task_info.contract，返回的是res，res[1]是状态，res[0]是当前账户，
            if(!err && res[1].toString() != '0' && res[0].toString() == web3.eth.defaultAccount){ // filter
                //如果是当前账户的任务的话才会存入到data中
                task_info.status = parseInt(res[1].toString());
                task_info.requester = res[0].toString();
                taskListInfo.data.push(task_info);
            }else{
                if(err) console.log(err);
            }
        })
    }else{
        console.log(error);
    }
});

var stateChanged = taskManagementContract.stateChanged({}, {fromBlock: 'latest'});


//系统自动修改状态
stateChanged.watch(function(error, result){
    if(!error){
        for(var i=0;i<taskListInfo.data.length;i++){
            if(taskListInfo.data[i].contract == result.args.contra){
                taskManagementContract.states(taskListInfo.data[i].contract,function(err,res){
                    if(!err && res[1].toString() != '0' && res[0].toString() == web3.eth.defaultAccount){ // filter
                        taskListInfo.data[i].status = parseInt(res[1].toString());
                    }else{
                        if(err) console.log(err);
                    }
                });
                break;
            }
        }
    }else{
        console.log(error);
    }
});

//发布任务

$(document).on("click","#publishTask",function(){
    $(this).attr('disabled','disabled');
    var that = $(this);
    var name = $("#name").val();
    if(!name || name.trim().length == 0){
        swal({
            type: 'error',
            title: 'Contract name cannot be empty!'
        });
        $(this).removeAttr('disabled');
        return;
    }
    var description = $("#description").val();
    if(!description || description.trim().length == 0){
        swal({
            type: 'error',
            title: 'Task description cannot be empty!'
        });
        $(this).removeAttr('disabled');
        return;
    }
    var reward = parseInt($("#reward").val());
    if(!reward || reward <= 0 || reward == NaN ){
        swal({
            type: 'error',
            title: 'Please enter a positive integer!'
        });
        $(this).removeAttr('disabled');
        return;
    }
    var waitTime = parseInt($("#waitTime").val());
    if(!waitTime || waitTime <= 0 || waitTime == NaN ){
        swal({
            type: 'error',
            title: 'Please enter a positive integer!'
        });
        $(this).removeAttr('disabled');
        return;
    }
    var longtidute =  $("#longitude").val();
    var latitude =  $("#latitude").val();

    MyContract.new(reward,longtidute,latitude, waitTime, description.trim(), name.trim(), {from:web3.eth.defaultAccount, data:bytecode, gas:500, value:100000000}, function (err, myContract) {

    })



    // swal({
    //     title: '确定发布任务?',
    //     type: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: 'Yes'
    // }).then((result) => {
    //     //这个地方咋办？
    //     //密码的验证呢？
    //     if (result.value) {
    //         swal({
    //             title: 'Enter your password',
    //             input: 'password',
    //             showCancelButton: true,
    //             inputAttributes: {
    //                 autocapitalize: 'off'
    //             }
    //         }).then((result) => {
    //             if(result.value != undefined || result.value != null){
    //
    //                 //账户解锁
    //                 web3.personal.unlockAccount(web3.eth.defaultAccount,result.value,function(err,result){
    //                     if(!err){
    //                         //编译，第一个进度条的
    //                         var cc = $(".progress:eq(0)").find("strong:eq(0)"); // compile contract text
    //                         //部署
    //                         var dc = $(".progress:eq(0)").find("strong:eq(1)"); // depoly contract text
    //                         $(".progress:eq(0)").show();
    //                         var cc_progress = cc.parent().parent();
    //                         var dc_progress = dc.parent().parent();
    //                         cc_progress.css('width','25%');
    //                         var cc_icon = cc_progress.find("span.glyphicon:eq(0)");
    //                         var dc_icon = dc_progress.find("span.glyphicon:eq(0)");
    //
    //                         //无意义地休息以执行那个过程
    //                         setTimeout(function(){ // meanless sleep
    //                             //这是在编译的意思吗？这里没懂
    //                             var contract_info = ipcRenderer.sendSync('synchronous-compileTask',JSON.stringify(compileData));
    //                             if(contract_info == -1){ // compile failed
    //                                 cc_progress.removeClass("progress-bar-success").addClass("progress-bar-danger");
    //                                 cc_progress.css('width','50%');
    //                                 cc_icon.removeClass("glyphicon-cog").addClass("glyphicon-remove");
    //                                 cc.text("合约编译失败");
    //                                 swal({
    //                                     type: 'error',
    //                                     title: 'Compile contract failed!'
    //                                 }).then((result) => {
    //                                     recoverModalAfterPublishTask(cc, dc, cc_progress, dc_progress, cc_icon, dc_icon, 1, 1);
    //                                     that.removeAttr('disabled');
    //                                 });
    //                             }else{
    //                                 cc_progress.css('width','50%');
    //                                 cc_icon.removeClass("glyphicon-cog").addClass("glyphicon-ok");
    //                                 cc.text("合约编译成功");
    //                                 setTimeout(function(){
    //                                     dc_progress.css('width','25%');
    //                                 },800);
    //                                 setTimeout(function(){ // meanless sleep again
    //                                     contract_info = JSON.parse(contract_info);
    //                                     let bytecode = contract_info.bytecode;
    //                                     let abi = JSON.parse(contract_info.abi);
    //                                     //估计需要花费gas
    //                                     let gasEstimate = web3.eth.estimateGas({data: bytecode});
    //                                     console.log(gasEstimate)
    //                                     let MyContract = web3.eth.contract(abi);
    //
    //                                     //新建了一个智能合约
    //                                     //返回合约实例及其所有方法和事件。
    //                                     MyContract.new(eachBonus, dataNumber, description.trim(), name.trim(), {from:web3.eth.defaultAccount, data:bytecode, gas:gasEstimate*2, value:eachBonus*dataNumber+100000000}, function(err, myContract){
    //                                         if(!err) {
    //                                             if(!myContract.address) {
    //                                                 console.log(myContract.transactionHash) // The hash of the transaction, which deploys the contract
    //                                             }else{
    //                                                 console.log(myContract.address) // the contract address
    //
    //                                                 //添加任务
    //                                                 taskManagementContract.addTask(myContract.address,contract_info.abi,name.trim(),description.trim(),{from:web3.eth.defaultAccount, gas:gasEstimate},function(err,res){
    //                                                     if(!err){
    //                                                         dc_progress.css('width','50%');
    //                                                         dc_icon.removeClass("glyphicon-cog").addClass("glyphicon-ok");
    //                                                         dc.text("合约部署成功");
    //                                                         swal({
    //                                                             type: 'success',
    //                                                             title: 'Depoly contract successfully!'
    //                                                         }).then((result) => {
    //                                                             recoverModalAfterPublishTask(cc, dc, cc_progress, dc_progress, cc_icon, dc_icon, 0, 0);
    //                                                             that.removeAttr('disabled');
    //                                                         });
    //                                                     }else{//插入任务失败
    //                                                         console.log(err);
    //                                                         dc_progress.removeClass("progress-bar-info").addClass("progress-bar-danger");
    //                                                         dc_progress.css('width','50%');
    //                                                         dc_icon.removeClass("glyphicon-cog").addClass("glyphicon-remove");
    //                                                         dc.text("合约部署失败");
    //                                                         swal({
    //                                                             type: 'error',
    //                                                             title: 'Depoly contract failed!'
    //                                                         }).then((result) => {
    //                                                             recoverModalAfterPublishTask(cc, dc, cc_progress, dc_progress, cc_icon, dc_icon, 0, 1);
    //                                                             that.removeAttr('disabled');
    //                                                         });
    //                                                     }
    //                                                 });
    //                                             }
    //                                         }else{//新建合约失败
    //                                             dc_progress.removeClass("progress-bar-info").addClass("progress-bar-danger");
    //                                             dc_progress.css('width','50%');
    //                                             dc_icon.removeClass("glyphicon-cog").addClass("glyphicon-remove");
    //                                             dc.text("合约部署失败");
    //                                             swal({
    //                                                 type: 'error',
    //                                                 title: 'Depoly contract failed!'
    //                                             }).then((result) => {
    //                                                 recoverModalAfterPublishTask(cc, dc, cc_progress, dc_progress, cc_icon, dc_icon, 0, 1);
    //                                                 that.removeAttr('disabled');
    //                                             });
    //                                         }
    //                                     });
    //                                 },1500);
    //                             }
    //                         },1500);
    //                     }else{
    //                         swal({
    //                             type: 'error',
    //                             title: 'Password is not correct!'
    //                         })
    //                         that.removeAttr('disabled');
    //                     }
    //                 })
    //             }
    //         })
    //     }
    // });
});


$("#submitTask").on('click', function() {
    console.log(" click ");
});

