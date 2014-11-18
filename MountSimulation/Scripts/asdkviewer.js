//orignal view
var viewer3DOrg;
//mount view
var viewer3DMount;
//collection of node ids of original view
var currNodesIds_Org = [];
//collection of nodes of mount view
var currNodes_Mount = [];
//mouse point of screen 
var mouse = new THREE.Vector2();
//projector of current view
var projector = new THREE.Projector();
//if mouse moving
var ismoving = false;
// object that is being mounted
var selectedObj;

var selid;
var frgid;
var node;

var stxx;
var styy;
var stzz;

var lastX = 100000000.1;
var lastY = 100000000.1;
var lastZ = 100000000.1;

var currentIndex;

var playDic = new Array();
var playDic_pos = new Array();

var startMount = false;
var currentfrgids = null;

var currentClientX;
var currentClientY;

var hasIniPageOrg = false;
var page_mount = true;
 
{


    iniMountView();
    startMount = false;


    //***document events**********
    document.onkeypress = function (ev) {
        if (ev.keyCode == 113) {
            //stop mounting
            ismoving = false;
            viewer3DMount.impl.invalidate(true);
        }
    }
     
    //when mouse moving
    document.getElementById("divViewerMount").onmousemove = function (ev) {
        ev.preventDefault();

        if (viewer3DMount) {

            if (ismoving &&
                currentfrgids && page_mount) {

                //calculate the 3D coordinates from mouse position

                //Canvas is the HTML Canvas of the viewer instance
                var canvas = document.getElementById("divViewerMount");
                //get camera
                var camera = viewer3DMount.getCamera();
                var clientRect = canvas.getBoundingClientRect(); 
                mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

                var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                projector.unprojectVector(vector, camera);

                if (lastX > 100000000 ||
                    lastY > 100000000 ||
                    lastZ > 100000000) {
                    //if moving just started
                    //since Viewer has not provided the mouse events, the sample
                    //set a large value as the difference of coordinates.
                    lastX = vector.x;
                    lastY = vector.y;
                    lastZ = vector.z;

                }
                else {

                    //get the difference of the current mouse coordinates and last coordinates
                    var difX = vector.x - lastX;
                    var difY = vector.y - lastY;
                    var difZ = vector.z - lastZ;

                    //move the objects qith the difference values.
                    moveX(difX);
                    moveY(difY);
                    moveZ(difZ);

                    //record the current values for next moving.
                    lastX = vector.x;
                    lastY = vector.y;
                    lastZ = vector.z;

                    viewer3DMount.impl.invalidate(true);

                }

            }
            else {
                //reset the values
                lastX = 100000000.1;
                lastY = 100000000.1;
                lastZ = 100000000.1;
            }
        }

    }

    //*********document events end****************

    //*********buttons****************************
    $('#btnSelectObj').click(function () {
                
        if (startMount) {
            alert("Mounting is running! Please click [Mount Off] and select objects");            
        }
        else {
            if (page_mount) {

                if (viewer3DMount) {                   
                    var objsToMount = viewer3DMount.getSelection();

                    if (objsToMount == null || objsToMount.length == 0) {
                        alert("no any objects have been selected!");
                    }
                    else {
                        if (objsToMount != null) {
                            currNodesIds_Org = [];
                            currNodes_Mount = [];
                            for (i = 0; i < objsToMount.length; i++) {
                                var thisNode = objsToMount[i];
                                currNodes_Mount.push(thisNode);
                                currNodesIds_Org.push(thisNode.dbId);
                            }
                            buildPlayDic_Mount();

                            viewer3DMount.clearSelection();
                        }
                    }
                }
            }
        }
    });

    //end mounting
    $('#radioMountOff').click(function () {
        if (viewer3DOrg) {
            //show all objects in orignal view
            viewer3DOrg.showAll();
        }

        //load mount view again thus all components are restored back to the original position. 
        iniMountView();


        //reset the relevant variables

        ismoving = false;
        startMount = false;

        currNodes_Mount = null;
        currNodesIds_Org = null;

        currentfrgids = null;
        playDic = null;
        playDic = new Array();
        playDic_pos = null;;
        playDic_pos = new Array();

        //remove the message div that appears when mounting
        var obj = $("#taskdiv");
        if (obj)
            obj.remove(); 
     
    });
    
    //start mounting
    $('#radioMountOn').click(function () {

        if (!hasIniPageOrg) {
            //if the original view has not been activated 
            $('#alertActivateOrg').modal('show');
            return;
        }
 
        if (currNodes_Mount==null || currNodes_Mount.length == 0) {
            alert("please select some mounting objects firstly!");
            return;
        }

        //display a message div to show the difference of the 
        //coordinates of the current position and original position
        var parentdiv = $('<div></div>');
        parentdiv.attr('id', 'taskdiv');
        parentdiv.html("");

        $(document.body).append(parentdiv);
        $("#taskdiv")[0].style.position = "absolute";
        $("#taskdiv")[0].style.left = "20px";
        $("#taskdiv")[0].style.top = "100px";
        $("#taskdiv")[0].style.zIndex = 10000;
        $("#taskdiv")[0].innerHTML =
            "Diff:(x= *,y=*,z=*) click the component, move mouse. press key [Q] to stop the moving.";

       
        if (viewer3DOrg) {
            //clear the selection of original view
            viewer3DOrg.clearSelection();
            // in original view, select the object which is being mounted.
            viewer3DOrg.select(currNodesIds_Org[0]);
        }

        //move the specific objects 
        //which are to be mounted away from the main body 
        for (thisItem in playDic) {
            var thisFrags = playDic[thisItem];
            moveaway(viewer3DMount, thisFrags);
        }

        //hide the objects which are not being mounted. 
        //they are in the waiting list to be mounted
        if (viewer3DMount) {
            for (var i = 0; i < currNodes_Mount.length; i++) {
                if (i != 0) {
                    var node = currNodes_Mount[i];
                    viewer3DMount.hide(node);
                }
            }
        }

        //current index of the specific objects
        currentIndex = 0;
        //fragments of the current specific object
        currentfrgids = playDic[currNodes_Mount[0].dbId];

        //start mounting
        startMount = true;

    });

    //switch to the next mounting object
    $('#btnNextComp').click(function () {

        //remove the message div that appears when mounting
        var obj = $("#taskdiv");
        if (obj)
            obj.remove();

        if (!startMount) {
            //if the original view has not been activated
            //show the warning page
            $('#alertMountNotStart').modal('show');
            return;
        }
        if (currentfrgids) {
            //if the mounting of last object has not completed
            alert("The last component has not been mounted correctly!");
            return;
        }

        if ( (currentIndex+1) == currNodes_Mount.length) {
            alert("all components have been mounted!");
            return;
        }

        //
        var parentdiv = $('<div></div>');
        parentdiv.attr('id', 'taskdiv');
        parentdiv.html("");

        $(document.body).append(parentdiv);
        $("#taskdiv")[0].style.position = "absolute";
        $("#taskdiv")[0].style.left = "20px";
        $("#taskdiv")[0].style.top = "100px";
        $("#taskdiv")[0].style.zIndex = 10000;
        $("#taskdiv")[0].innerHTML =
            "Diff:(x= *,y=*,z=*) click the component, move mouse. press key [Q] to stop the moving.";

        currentIndex++;
        var node = currNodes_Mount[currentIndex];
        currentfrgids = playDic[node.dbId]; 

        viewer3DOrg.clearSelection();
        viewer3DOrg.select(currNodesIds_Org[currentIndex]);

        if (viewer3DMount) {
            var node = currNodes_Mount[currentIndex];
            viewer3DMount.show(node);
            currentfrgids = playDic[node.dbId];
            startMount = true;
        }

    });  
    

    //help video
    $('#btnHelp').click(function () {
        $('#demoHelpVideo').modal('show');
    });

    $("#myCarousel").carousel('pause');

    $('#myCarousel').bind('slide.bs.carousel', function (e) {
 
        if (!hasIniPageOrg) {
            iniOrgView();
            hasIniPageOrg = true;
        }

        if (page_mount) {
            var obj = $("#taskdiv");
            if (obj)
                obj.hide();
        }
        else {
            var obj = $("#taskdiv");
            if (obj)
                obj.show();
        }

        page_mount = !page_mount;
    }); 
   
} 
 
//********functions for Viewer************
function iniOrgView() {
    
    var documentId = document.getElementById("viewerDefaultURN").value;
    var thistoken = document.getElementById("viewertoken").value;
    var options = {
        'document': documentId,
        'accessToken': thistoken
    };

    //original view
    Autodesk.Viewing.Initializer(options, function () {
        // Create a Viewer3D 
        var divViewerOrgContainer = document.getElementById('divViewerOrg');
        viewer3DOrg = new Autodesk.Viewing.Viewer3D(divViewerOrgContainer, {});

        viewer3DOrg.initialize();

        // Load the document and associate the document with our Viewer3D 
        Autodesk.Viewing.Document.load(documentId,
            Autodesk.Viewing.Private.getAuthObject(),
            onSuccessDocumentLoadCB_org,
            onErrorDocumentLoadCB_org); 
    });

}
 
function iniMountView() {
     
    var documentId = document.getElementById("viewerDefaultURN").value;
    var thistoken = document.getElementById("viewertoken").value;
    var options = {
        'document': documentId,
        'accessToken': thistoken
    };

    //mount view
    Autodesk.Viewing.Initializer(options, function () {
        // Create a Viewer3D 
        var divViewerMountContainer = document.getElementById('divViewerMount');
        viewer3DMount = new Autodesk.Viewing.Viewer3D(divViewerMountContainer, {});

        viewer3DMount.initialize();

        // Load the document and associate the document with our Viewer3D 
        Autodesk.Viewing.Document.load(documentId,
            Autodesk.Viewing.Private.getAuthObject(),
            onSuccessDocumentLoadCB_mount,
            onErrorDocumentLoadCB_mount);
 
        viewer3DMount.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            onSelectedCallback_Mount);
    });
} 

//load model to orignal viewer
function onSuccessDocumentLoadCB_org(viewerDocument) {

    currentViewerDoc = viewerDocument;
    var rootItem = viewerDocument.getRootItem();

    var geometryFilter3d = { 'type': 'geometry', 'role': '3d' };
    //store in globle variable 
    geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, geometryFilter3d, true);

    if (geometryItems.length > 0) {

        var item3d = viewerDocument.getViewablePath(geometryItems[0]);

        viewer3DOrg.load(item3d);
        viewer3DOrg.setGhosting(true);
        viewer3DOrg.addEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
              function (event) { 
                  viewer3DOrg.fitToView(false);
              }); 
    }
    else { 
    }
}

//load model to mounting viewer
function onSuccessDocumentLoadCB_mount(viewerDocument) {

    currentViewerDoc = viewerDocument;
    var rootItem = viewerDocument.getRootItem();

    var geometryFilter3d = { 'type': 'geometry', 'role': '3d' };
    //store in globle variable 
    geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, geometryFilter3d, true);

    if (geometryItems.length > 0) {

        var item3d = viewerDocument.getViewablePath(geometryItems[0]);

        viewer3DMount.load(item3d);
        viewer3DMount.setGhosting(true);
        viewer3DMount.addEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            function (event) { 
                viewer3DMount.fitToView(false);
            }); 
    }
    else {
         console.log("3d Geometry not found in document : " + documentId);
    }
}

function onErrorDocumentLoadCB_org(viewerDocument) {
}

function onErrorDocumentLoadCB_mount(viewerDocument) {
}

//build the dictionay of mounting
function buildPlayDic_Mount() { 

    var mesh = viewer3DMount.impl.model.getData();
    var frgs = mesh.fragments;
    var frag2dbid = frgs.fragId2dbId;

    var mtx;

    for (i = 0; i < currNodes_Mount.length; i++) {
        var node = currNodes_Mount[i];
       
        var nodefrags = new Array()
        searchTree(node, nodefrags);
        //if (thisFrags != null)
        {
            //store all fragments and the orignal matrix (position) of one parent node
            var mtx = viewer3DMount.impl.
                getRenderProxy(viewer3DMount.model, nodefrags[0]).
                matrixWorld.elements;

            if (node.dbId in playDic) {
                playDic[node.dbId].push(nodefrags);
                playDic_pos[node.dbId].push(mtx);
            }
            else {
                playDic[node.dbId] = nodefrags;
                var corVs = new Array();
                corVs[0] = mtx[12];
                corVs[1] = mtx[13];
                corVs[2] = mtx[14];

                playDic_pos[node.dbId] = corVs;
            } 

            var xx = 0;
        } 
    }
} 

//find out all fragments of one parent object
function searchTree(element, frags) {
    if (element.fragIds != null) {
        {
            if (element.fragIds.constructor === Array) {
                for (var j = 0; j < element.fragIds.length; j++) {
                    frags.push(element.fragIds[j]);
                }
            }
            else {
                frags.push(element.fragIds);
            }

        }
    } else if (element.children != null) { 
        for (var i = 0; i < element.children.length; i++) {
            searchTree(element.children[i], frags);
        } 
    } 
}  

// move the objects away along x,y,z
function moveaway(viewer3D, frgid) {

    //if (viewer3D) 
    {
        //calculate the 3d coordinate from 2d data
        var camera = viewer3D.getCamera();

        var canvas = document.getElementById("divViewerMount");
        //Canvas is the HTML Canvas of the viewer instance
        var clientRect = canvas.getBoundingClientRect(); 
        var awaylocation = new THREE.Vector2();

        //3d coordinates
        awaylocation.x = ((clientRect.right - clientRect.right/10) / window.innerWidth) * 2 - 1;
        awaylocation.y = -((clientRect.top + clientRect.top/10) / window.innerHeight) * 2 + 1;

        var awaylocationvector = new THREE.Vector3(awaylocation.x, awaylocation.y, 0.5);
        projector.unprojectVector(awaylocationvector, camera);
        
        //move the objects one by one.
        var mtx;
        if (frgid.constructor === Array) {
            //if a group of objects
            for (var i = 0; i < frgid.length; i++) {
                var mtx = viewer3D.impl.getRenderProxy(viewer3D.model, frgid[i]).matrixWorld.elements;
                mtx[12] = awaylocationvector.x;
                mtx[13] = awaylocationvector.y;
                mtx[14] = awaylocationvector.z;
 
            }
        }
        else {
            //if a single object
            var mtx = viewer3D.impl.getRenderProxy(viewer3D.model, frgid).matrixWorld.elements;
            mtx[12] += awaylocationvector.x;;
            mtx[13] += awaylocationvector.y;;
            mtx[14] += awaylocationvector.z;;
        }

        //ask viewer to refresh
        viewer3D.impl.invalidate(true);
    }

}

//selection event
function onSelectedCallback_Mount(event) {

    if (startMount) { 

        var msg = '';
        if (event.dbIdArray.length > 0) {

            //in moving status      
            ismoving = true;
            //get the original position data.
            var corVs = playDic_pos[currNodes_Mount[currentIndex].dbId];

            //orignal x, y, z
            stxx = corVs[0];
            styy = corVs[1];
            stzz = corVs[2]; 
        }
    }

}

//check if current position is the correct position
function isOK() {

    //check the current position of the current object
    if (viewer3DMount) {
        var mtx;
         if (currentfrgids.constructor === Array) {
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[0]).matrixWorld.elements;
        }
        else {
             mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        }

        //showing the differences of the current position with the original position
         var obj = $("#taskdiv");
         if (obj) {

             var diffx = Math.abs(mtx[12] - stxx);
             var diffy = Math.abs(mtx[13] - styy);
             var diffz = Math.abs(mtx[14] - stzz);

               $("#taskdiv")[0].innerHTML = "Diff: (x=" + (Math.round(diffx*100)/100).toString() + ",y=" +
                                (Math.round(diffy * 100) / 100).toString() + ",z=" +
                               (Math.round(diffz * 100) / 100).toString() + ")" + "  click the component, move mouse. press key [Q] to stop the moving.";;
         }

        //if the difference is much small in a tolerance, successful
        if (Math.abs(mtx[12] - stxx) < 2.0 &&
            Math.abs(mtx[13] - styy) < 2.0 &&
            Math.abs(mtx[14] - stzz) < 2.0) {
            //play an audio to cheer
            sound.src = "content/Ring10.wav";
            sound.play();

            //alert message of successful mounting
            $('#alertGoodMount').modal('show');

            ismoving = false;
            currentfrgids = null;

            //force the objects to the original position because the difference is much small
            mtx[12] = stxx;
            mtx[13] = styy;
            mtx[14] = stzz;

            //remove the message of differences
            var obj = $("#taskdiv");
            if(obj)
                obj.remove();

        }
    }
}

//move object in X with one step
function moveX(step) {
    
    //if not in mounting status
    if (!startMount)
        return;

    //move the objects one by one with the step
    var mtx;
    if (currentfrgids.constructor === Array) {
        //if a group of objects
        for (var i = 0; i < currentfrgids.length; i++) {
            mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[i]).matrixWorld.elements;
            mtx[12] += step;
        }
    }
    else {
        //if a single object
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        mtx[12] += step;

    }

    //ask viewer to refresh
    viewer3DMount.impl.invalidate(true);

    //check if current position is the correct position
     isOK();
}

//move object in Y with one step
function moveY(step) {
    
    //if not in mounting status 
    if (!startMount)
        return;

    //move the objects one by one with the step
    var mtx;
    if (currentfrgids.constructor === Array) {
        //if a group of objects
        for (var i = 0; i < currentfrgids.length; i++) {
            mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[i]).matrixWorld.elements;
            mtx[13] += step;
        }
    }
    else {
        //if a single object
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        mtx[13] += step;
    }

    //ask viewer to refresh
    viewer3DMount.impl.invalidate(true);

    //check if current position is the correct position
     isOK();
}

//move object in Z with one step
function moveZ(step) {
  
    //if not in mounting status 
    if (!startMount)
        return;

    //move the objects one by one with the step
    var mtx;
    if (currentfrgids.constructor === Array) {
        //if a group of objects
        for (var i = 0; i < currentfrgids.length; i++) {
            mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[i]).matrixWorld.elements;
            mtx[14] += step;
        }
    }
    else {
        //if a single object
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        mtx[14] += step;

    }

    //ask viewer to refresh
    viewer3DMount.impl.invalidate(true);

    //check if current position is the correct position
     isOK();
}

//*******end functions for Viewer