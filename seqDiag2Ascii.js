var that={};
module.exports=that;
var fs=require('fs');
var _printer=require('./printer.js');
var _entities=require('./entities.js');
var _nodes=[];
var _grammarParser=require('grammarParser');
var _grammarHelper=(function InitGrammar(){
  var s=fs.readFileSync(__dirname+'/grammar.txt').toString();
  var grammar=_grammarParser.grammarFromString(s);
  var nf = _grammarParser.NodeFactory();
  
  var depth=0;
  var nodeEntities={0:[]};
  nf.register('_anyLine',function(name,nodeList, matchedStr){
    //not supported right now
    console.log('SYNTAX FAIL '+matchedStr);
    return {toString:function(){return 'Fail to parse >'+matchedStr+'<'}};
  }).register('message',function(name,nodeList){return {toString:function(){
      var actorLeft={name:nodeList[0].toString()};
      var actorRight={name:nodeList[4].toString()};
      var text=nodeList[6].toString();
      var msg=_entities.newMessage(actorLeft,actorRight,text);
      nodeEntities[depth].push(msg);
      return msg.toString();
    }}
  }).register('note',function(name,nodeList){return {toString:function(){
      var leftRight=nodeList[2].toString();
      var actor={name:nodeList[6].toString()};
      var text=nodeList[8].toString();
      var note=_entities.newNote(text,actor,leftRight);
      nodeEntities[depth].push(note);
      return note.toString();
    }}
  }).register('_title',function(name,nodeList,matchedStr){return{toString:function(){
    //not supported right not
      return matchedStr;
    }}
  }).register('alternative',function(name,nodeList){return{toString:function(){
      var condition=nodeList[1].nodeList[1].toString();
      depth++;
      nodeEntities[depth]=[];
        nodeList[3].toString();
        var altNodes=nodeEntities[depth];
        nodeEntities[depth]=[];
        nodeList[4].toString();
        var elseNodes=nodeEntities[depth];
      depth--;
      var alternative=_entities.newAlternative(condition, altNodes, elseNodes);
      nodeEntities[depth].push(alternative)
    }}
  }).register('loop',function(name,nodeList){return{toString:function(){
      var condition=nodeList[1].nodeList[1].toString();
      depth++;
      nodeEntities[depth]=[];
        nodeList[3].toString();
        var nodes=nodeEntities[depth];
      depth--;
      var alternative=_entities.newLoop(condition, nodes);
      nodeEntities[depth].push(alternative)
    }}
  }).register('opt',function(name,nodeList){return{toString:function(){
      var condition=nodeList[1].nodeList[1].toString();
      depth++;
      nodeEntities[depth]=[];
        nodeList[3].toString();
        var nodes=nodeEntities[depth];
      depth--;
      var alternative=_entities.newOptional(condition, nodes);
      nodeEntities[depth].push(alternative)
    }}
  })
  return {
    parse:function(str){
      depth=0;
      nodeEntities={0:[]};
      var backOptions={left:str, nodeList:[]};
      _grammarParser.doPred(grammar, nf, 'sd2a', backOptions);
      var node = nf.applyFunc('master', backOptions.nodeList);
      node.toString();
      return nodeEntities[0];
    }
  }
  
  
})();
that.buildFromString=function(s,cbk){
  var nodeEntities=_grammarHelper.parse(s+"\n");
  that.setNodes(nodeEntities);
  cbk&&cbk(s);
}
that.print=function(cbkStr){
  cbkStr=cbkStr?cbkStr:function(err,str){console.log(err?err:str)}
  
  var actors=that.getActorList();
  var widths=that.getMinWidths(actors);
  var error=configurePrinter(actors,widths);
  if(error){
    return cbkStr(error);
  }
  var line=_printer.newLine();
  var mostLeft=_printer.mostLeftPositionActor();
  for(var i=0; i<actors.length;++i){
    var actor=actors[i];
    line.override(mostLeft - Math.ceil((actor.name.length-1)/2),actor.name);
    mostLeft+=widths[i];
  }
  _printer.newLine();
  _printer.newLine();
  
  _nodes.forEach(function(node){
    node.print(_printer);
  });
  _printer.newLine();
  _printer.newLine();
  return cbkStr(_printer.toString());
}
that.setNodes=function(nodes){
  _nodes=nodes;
}
that.addNode=function(node){
  _nodes.push(node);
  return that;
}
that.getActorList=function(){
  var actorsNotUniq=[];
  var act=[];
  var later=[];
  _nodes.forEach(function(actorNode){
    if(!actorNode.hasOwnProperty('name')){
      return;
    }
    if(actorNode.name=='ActorList'){
      act=act.concat(actorNode.actors);
    }else if(actorNode.name=='message'){
      later.push(actorNode.a);
      later.push(actorNode.b);
    }else if(actorNode.name=='note'){
      later.push(actorNode.actor);
    }else if(['Alt','Opt','Loop'].indexOf(actorNode.name)!=-1){
      later=later.concat(actorNode.getActors());
    }
  });
  actorsNotUniq = actorsNotUniq.concat(act, later);
  var keyActors={};
  var actors=[];
  actorsNotUniq.forEach(function(x){
    if(x.name in keyActors){
      return;
    }
    keyActors[x.name]=true;
    actors.push(x);
  });
  return actors;
}
that.getMinWidths=function(actors){
  function setLengthIfGreater(index, length){
    if(!widths[index] || widths[index]<length){
      widths[index]=length;
    }
  }
  function indexOfActor(actor){
    return actors.map(function(x){return x.name;}).indexOf(actor.name);
  }
  var widths=[];
  var position=0;
  for(var i=1;i<actors.length;++i){
    var width=Math.ceil(actors[i-1].name.length/2) + Math.ceil(actors[i].name.length/2)+1;
    widths.push(width);
  }
  var leafNodes=_nodes.filter(function(node){
    return node.name && ['message', 'note'].indexOf(node.name)!=-1;
  });
  //update leaf with adjacent actors
  var leftMessages=[];
  leafNodes.forEach(function(node){
    if(node.name=='note'){
      var index=indexOfActor(node.actor);
      if(node.leftOrRight=='left'){
        if(index!=0){
          setLengthIfGreater(index-1, node.width()+1);//+1 for actor right border
        }
      }else{
        if(index!=actors.length-1){
          setLengthIfGreater(index, node.width()+1);
        }
      }
    }else if(node.name=='message'){
      var left=indexOfActor(node.a);
      var right=indexOfActor(node.b);
      if(right<left){
        var temp=left;
        left=right;
        right=temp;
      }
      if(right-left<=1){
        setLengthIfGreater(left, node.width()+1);
      }else{
        leftMessages.push(node);
      }
    }
  });
  
  //update leaf with not adjacent actors. Gives delta width for actors in the middle
  leftMessages.forEach(function(node){
    var messageWidth=node.width();
    var left=indexOfActor(node.a);
    var right=indexOfActor(node.b);
    if(right<left){
      var temp=left;
      left=right;
      right=temp;
    }
    var currentWidth=0;
    for(var i=left;i<right;++i){
      currentWidth+=widths[i];
    }
    if(currentWidth<messageWidth){
      var delta=Math.ceil((messageWidth-currentWidth)/(right-left));
      for(var i=left;i<right;++i){
        widths[i]+=delta;
      }
    }
  });
  return widths;
}
that.getPadding=function(widths, actors){
  var totalWidth=widths.reduce(function(a,b){return a+b});
  totalWidth+=Math.ceil(actors[0].name.length/2);
  totalWidth+=Math.ceil(actors[actors.length-1].name.length/2);
  var minWidth=0;
  _nodes.filter(function(x){
    return x.name && ['Opt','Alt','Loop'].indexOf(x.name)!=-1;
  }).forEach(function(x){
    var width=x.minWidth();
    if(width>minWidth){
      minWidth=width;
    }
  });
  var padding=Math.max(Math.ceil(actors[0].name.length/2),Math.ceil(actors[actors.length-1].name.length/2));
  if(minWidth>totalWidth){
    padding=Math.ceil((minWidth-totalWidth)/2);
  }
  return padding;
}
function configurePrinter(actors, widths){
  var o={};
  if(actors.length==0){
    return 'expect one actor';
  }
  var padding = that.getPadding(widths, actors);
  o.actors=actors;
  o.widths=widths;
  o.paddingLeft=padding+50;
  o.paddingRight=padding;
  _printer.configure(o);
}

