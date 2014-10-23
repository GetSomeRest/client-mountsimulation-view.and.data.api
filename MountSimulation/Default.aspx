<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="MountSimulation.WebForm1" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title></title> 
   <link href="Scripts/bootstrap.min.css" rel="stylesheet">
   <script src="Scripts//jquery.min.js"></script>
   <script src="Scripts//bootstrap.min.js"></script>

    <link rel="stylesheet" href="https://developer.api.autodesk.com/viewingservice/v1/viewers/style.css" />
    <script src="https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.min.js"></script>

    <style type="text/css">
        #txtmoveawaystep {
            width: 63px;
        }
        #corVector {
            width: 65px;
        }
        #stV {
            margin-left: 163px;
        }
        #corDiff {
            width: 450px;
        }
    </style>

</head>
<body> 
    <form id="form1" runat="server">
    <asp:HiddenField ID="viewertoken" runat="server" />
         
     </form> 

    <div id="myCarousel" class="carousel slide">
   <!-- 轮播（Carousel）指标 -->
   <ol class="carousel-indicators">
      <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
      <li data-target="#myCarousel" data-slide-to="1"></li> 
   </ol>    

   <!-- 轮播（Carousel）项目 -->
   <div class="carousel-inner">
      <div class="item active">
         <img src="content/1.png" alt="First slide">
          <div style="float:left; width:100px; height:40px;">              
          </div>
           <div style="margin:0 200px; height:40px;">               
                <div class="btn-group" data-toggle="buttons">
                       <label class="btn btn-primary" id="radioMountOff">
                          <input type="radio" name="options" /> Mount Off
                       </label>
                       <label class="btn btn-primary" id="radioMountOn">
                          <input type="radio" name="options" /> Mount On
                       </label> 
                 </div>
                     <button id="btnNextComp" type="button" class="btn btn-success" >Next Comp>></button> 
                    <div class="btn-group">                        
                         <button id="btnXPlus" type="button" onclick="moveX(0.5);" class="btn btn-info">MoveX+</button>
                        <button id="btnXMinus" type="button"  onclick="moveX(-0.5);" class="btn btn-info">MoveX-</button>
                        <button id="btnYPlus" type="button" onclick ="moveY(0.5);" class="btn btn-info">MoveY+</button>
                        <button id="btnYMinus" type="button" onclick="moveY(-0.5);" class="btn btn-info">MoveY- </button>
                        <button id="btnZPlus" type="button"   onclick="moveZ(0.5);" class="btn btn-info">MoveZ+</button>
                        <button id="btnZMinus" type="button"   onclick="moveZ(-0.5);" class="btn btn-info">moveZ-</button>   
                    </div> 
                    
          </div>
          <div style="float:right; width:100px; height:60px;">               
          </div>
          <div id="divViewerMount" style="height: 800px; width: 300px;" >  
         </div> 
           
      </div>
      <div class="item ">

         <img src="content/2.png" alt="Second slide">
          <div style="float:left; width:100px; height:60px;">              
          </div>
           <div style="margin:0 200px; height:60px;"> 
               <h1>Orignal Model</h1>
        </div>
          <div style="float:right; width:100px; height:60px;">               
          </div>
         <div id="divViewerOrg" style="height: 800px; width: 300px;"  >                                
          </div>
      </div>
    
   </div>
   
   <a class="carousel-control left" href="#myCarousel" 
      data-slide="prev">&lsaquo;</a>
   <a class="carousel-control right" href="#myCarousel" 
      data-slide="next">&rsaquo;</a>
</div> 
     <audio controls="controls" id="sound">
          <source src="content/Ring10.wav" >
       </audio>

      <div id="alertGoodMount" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"> 
                    <h4 class="modal-title">Mount Succeeded! Click [Next Comp] to mount the next object</h4>
                </div>  
                <div class="modal-footer">
                  
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>

            </div>
        </div>
    </div>


        <div id="alertMountNotStart" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"> 
                    <h4 class="modal-title">Mount has not been started! Click [Mount On]!</h4>
                </div>  
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>

            </div>
        </div>
    </div>

         <div id="alertActivateOrg" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"> 
                    <h4 class="modal-title">Please firstly activate orignal model view by clicking the arrow on the top-right corner of this page, and swtich back to this page again.</h4>
                </div>  
                <div><img src="Content/activateorg.gif" /></div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>

            </div>
        </div>
    </div>

</body>

<script type="text/javascript" src="Scripts/asdkviewer.js"></script>
    <script type="text/javascript"  >
        //************
        document.onkeypress = function (ev) {
            if (ev.keyCode == 113) {
                //var obj = $("#taskdiv");
                //if(obj)
                //    obj.remove();

                ismoving = false;
                viewer3DMount.impl.invalidate(true);
            }
        }

        $('#radioMountOff').click();

        $('#radioMountOff').click(function () {
            if (viewer3DOrg) {
                viewer3DOrg.showAll();
            }

            currNodesMount = null;;
            currNodesMount = [];
            playDic = null;
            playDic = new Array();
            playDic_pos = null;;
            playDic_pos = new Array();


            iniMountView();

            currentfrgids = null;

            var obj = $("#taskdiv");
            if (obj)
                obj.remove();

            ismoving = false;
            startMount = false;
        });

        $('#radioMountOn').click(function () {

            if (!currentPage) {
                $('#alertActivateOrg').modal('show');
                return;
            }

            var parentdiv = $('<div></div>');
            parentdiv.attr('id', 'taskdiv');
            parentdiv.html("");

            $(document.body).append(parentdiv);
            $("#taskdiv")[0].style.position = "absolute";
            $("#taskdiv")[0].style.left = "20px";
            $("#taskdiv")[0].style.top = "100px";
            $("#taskdiv")[0].style.zIndex = 10000;
            $("#taskdiv")[0].innerHTML = "Diff:(x= *,y=*,z=*) click the component, move mouse. press key [Q] to stop the moving.";

            if (viewer3DOrg) {

                //viewer3DOrg.isolateById(allNodesOrg[0].dbId);
                //for (var i = 0; i < allNodesOrg.length; i++) {  
                //    var node = allNodesOrg[i];
                //    if(currNodesOrg[0].dbId != node.dbId)
                //        viewer3DOrg.isolate(node);                    
                //}         
                viewer3DOrg.clearSelection();
                viewer3DOrg.select(currNodesOrg[0].dbId);
                //viewer3DOrg.isolateById(currNodesOrg[0].dbId);
            }


            for (thisItem in playDic) {
                var thisFrags = playDic[thisItem];
                moveaway(viewer3DMount, thisFrags);
            }

            if (viewer3DMount) {
                for (var i = 0; i < currNodesMount.length; i++) {
                    if (i != 0) {
                        var node = currNodesMount[i];
                        viewer3DMount.hide(node);
                    }
                }
            }

            currentIndex = 0;

            currentfrgids = playDic[currNodesMount[0].dbId];

            startMount = true;

        });

        $('#btnNextComp').click(function () {

            if (!startMount) {
                $('#alertMountNotStart').modal('show');
                return;
            }
            if (currentfrgids) {
                alert("The last component has not been mounted correctly!");
                return;
            }


            var parentdiv = $('<div></div>');
            parentdiv.attr('id', 'taskdiv');
            parentdiv.html("");

            $(document.body).append(parentdiv);
            $("#taskdiv")[0].style.position = "absolute";
            $("#taskdiv")[0].style.left = "20px";
            $("#taskdiv")[0].style.top = "100px";
            $("#taskdiv")[0].style.zIndex = 10000;
            $("#taskdiv")[0].innerHTML = "Diff: ";

            currentIndex++;
            var node = currNodesMount[currentIndex];
            currentfrgids = playDic[node.dbId];

            //if (viewer3DOrg) { 
            //    viewer3DOrg.showAll();
            //    viewer3DOrg.isolateById(currNodesOrg[currentIndex].dbId);

            //}

            viewer3DOrg.clearSelection();
            viewer3DOrg.select(currNodesOrg[currentIndex].dbId);

            if (viewer3DMount) {
                var node = currNodesMount[currentIndex];
                viewer3DMount.show(node);
                currentfrgids = playDic[node.dbId];
                startMount = true;
            }

        });

        document.getElementById("divViewerMount").onmousemove = function (ev) {
            ev.preventDefault();


            if (viewer3DMount) {

                if (ismoving &&
                    currentfrgids && page1) {


                    var camera = viewer3DMount.getCamera();

                    var canvas = document.getElementById("divViewerMount");
                    var clientRect = canvas.getBoundingClientRect(); //Canvas is the HTML Canvas of the viewer instance

                    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

                    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                    projector.unprojectVector(vector, camera);

                    if (lastX > 100000000 || lastY > 100000000 || lastZ > 100000000) {
                        lastX = vector.x;
                        lastY = vector.y;
                        lastZ = vector.z;

                    }
                    else {
                        var difX = vector.x - lastX;
                        var difY = vector.y - lastY;
                        var difZ = vector.z - lastZ;

                        moveX(difX);
                        moveY(difY);
                        moveZ(difZ);

                        lastX = vector.x;
                        lastY = vector.y;
                        lastZ = vector.z;

                        viewer3DMount.impl.invalidate(true);

                    }

                }
                else {
                    lastX = 100000000.1;
                    lastY = 100000000.1;
                    lastZ = 100000000.1;
                }
            }

        }


    </script>
</html>
