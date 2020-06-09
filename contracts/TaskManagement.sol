pragma solidity ^0.5.0;

//管理自己的智能合约

contract TaskManagement{

    //结构体，任务状态
    struct taskState{
        address requester;
        uint state;
    }
    //一个任务的状态有一个地址，一个地址对应一个结构体，取得名字是states
    mapping(address => taskState) public states;


    //自身管理的所有的任务
    event taskList(address contra, string taskabi, string taskName, string taskDescrip);

    function addTask(address contra, string taskabi, string taskName, string taskDescrip)
    public
    {
        //还没有上链的任务的state是0
        require(states[contra].state == 0);
        //state => 1:ACTIVE 2:ABORT 3:COMPLETE
        states[contra] = taskState(msg.sender, 1);//这个地方有点问题
        emit taskList(contra, taskabi, taskName, taskDescrip);
    }

    event stateChanged(address contra);

    //合约地址，请求者？？
    function changeState(address contra, uint _state)
    public
    {
        // require(states[contra].state == 1 && msg.sender == states[contra].requester);
        require(states[contra].state == 1);
        states[contra].state = _state;
        emit stateChanged(contra);
    }


}