pragma solidity ^0.5.0;

//管理自己的智能合约

contract TaskManagement{

    //结构体，任务状态
    struct taskState{
        address requester;
        uint state;
    }
    //一个节点有一个地址，一个地址下有任务的状态
    mapping(address => taskState) public states;


    //自身管理的所有的任务
    event taskList(address contra, string taskabi, string taskName, string taskDescrip);

    function addTask(address contra, string taskabi, string taskName, string taskDescrip)
    public
    {
        require(states[contra].state == 0);
        //state => 1:ACTIVE 2:ABORT 3:COMPLETE
        states[contra] = taskState(msg.sender, 1);
        emit taskList(contra, taskabi, taskName, taskDescrip);
    }
}