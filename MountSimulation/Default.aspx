<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="MountSimulation.WebForm1" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title></title> 
   <link href="Scripts/bootstrap.min.css" rel="stylesheet">
   <script src="Scripts/jquery.min.js"></script>
   <script src="Scripts/bootstrap.min.js"></script>

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
         
         <asp:HiddenField ID="viewerDefaultURN" runat="server" />
         
     </form> 

    <div id="myCarousel" class="carousel slide">
   <!-- Carousel indicators -->
   <ol class="carousel-indicators">
      <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
      <li data-target="#myCarousel" data-slide-to="1"></li> 
   </ol>    

   <!-- Carousel items -->
   <div class="carousel-inner">
      <div class="item active">
         <img src="content/1.png" alt="First slide">
          <div style="float:left; width:100px; height:40px;">              
          </div>
           <div style="margin:0 200px; height:40px;">        
               <button id="btnSelectObj" type="button" class="btn btn-warning">Select Objects</button>       
                <div class="btn-group" data-toggle="buttons">                      
                       <label class="btn btn-primary" id="radioMountOff">
                         <%--  button that switches mounting off--%>
                          <input type="radio" name="options" /> Mount Off
                       </label>
                       <label class="btn btn-primary" id="radioMountOn">
                            <%--  button that switches mounting on--%>
                          <input type="radio" name="options" /> Mount On
                       </label> 
                 </div>
                <%--  button that starts the next component --%>
                     <button id="btnNextComp" type="button" class="btn btn-success" >Next Comp>></button> 
                    <div class="btn-group">                   
                         <%--  buttons that tune the moving--%>     
                         <button id="btnXPlus" type="button" onclick="moveX(0.5);" class="btn btn-info">MoveX+</button>
                        <button id="btnXMinus" type="button"  onclick="moveX(-0.5);" class="btn btn-info">MoveX-</button>
                        <button id="btnYPlus" type="button" onclick ="moveY(0.5);" class="btn btn-info">MoveY+</button>
                        <button id="btnYMinus" type="button" onclick="moveY(-0.5);" class="btn btn-info">MoveY- </button>
                        <button id="btnZPlus" type="button"   onclick="moveZ(0.5);" class="btn btn-info">MoveZ+</button>
                        <button id="btnZMinus" type="button"   onclick="moveZ(-0.5);" class="btn btn-info">moveZ-</button>   
                    </div> 
                 <button id="btnHelp" type="button" class="btn btn-warning">Help</button>   
                    
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
     <%-- audio for successful mounting--%>
     <audio controls="controls" id="sound">
          <source src="content/Ring10.wav" >
       </audio>

     <%--  warning message when mounting succeeds--%>
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


     <%-- warning message when mount on button is not clicked.--%>
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

     <%-- warning message when orignal view has not been activated.--%>
         <div id="alertActivateOrg" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"> 
                    <h4 class="modal-title">Please firstly activate orignal model view by clicking the arrow on the top-right corner of this page, and switch back to this page again.</h4>
                </div>  
                <div><img style="width:400px" src="Content/activateorg.gif" /></div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>

            </div>
        </div>
    </div>

       <%-- demo video.--%>
         <div id="demoHelpVideo" class="modal fade">
        <div   class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"> 
                    <h4 class="modal-title">Demo Video</h4>
                </div>  
                <div ><img style="width:400px" src="Content/helpvideo.gif" /></div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>

            </div>
        </div>
    </div>

</body>

<script type="text/javascript" src="Scripts/asdkviewer.js"></script>
     
</html>
