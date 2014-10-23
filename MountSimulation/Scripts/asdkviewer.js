var viewer3DOrg;
var viewer3DMount;

var currNodesOrg = [];
var currNodesMount = [];

var allNodesOrg = [];

var mouse = new THREE.Vector2();
var projector = new THREE.Projector();

var ismoving = false;
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

var startMount;
var currentfrgids = null;

var currentClientX;
var currentClientY;

var currentPage = false;
var page1 = true;
 
{ 

    
    $("#myCarousel").carousel('pause');

    $('#myCarousel').bind('slide.bs.carousel', function (e) {

        console.log('slide event!');
        if (!currentPage) {
            iniOrgView();
            currentPage = true;
        }

    if (page1) {
            var obj = $("#taskdiv");
            if (obj)
                obj.hide();
        }
        else {

            var obj = $("#taskdiv");
            if (obj)
                obj.show();
        }

        page1 = !page1;
         

    });

    iniMountView();
    

    startMount = false;

}

 

function iniOrgView() {
    var documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGV2ZGF5c3NhbXBsZXMvQWNjdW11bGF0b3JfbTMubndk";
    //var documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGV2ZGF5c3NhbXBsZXMvQWNjdW11bGF0b3Iubndk";

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

    var documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGV2ZGF5c3NhbXBsZXMvQWNjdW11bGF0b3JfbTMubndk";
    //var documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGV2ZGF5c3NhbXBsZXMvQWNjdW11bGF0b3Iubndk";

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
                  buildPlayDic_Org();
              });


        //console.log("Loading 3d Geometry from document : " + documentId);
    }
    else {
        //console.log("3d Geometry not found in document : " + documentId);
    }
}

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
                buildPlayDic_Mount();
            });

        //camara event
  viewer3DMount.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, cameraChangedEventCB_Mount);

        //console.log("Loading 3d Geometry from document : " + documentId);
    }
    else {
        //console.log("3d Geometry not found in document : " + documentId);
    }
}

function onErrorDocumentLoadCB_org(viewerDocument) {
}

function onErrorDocumentLoadCB_mount(viewerDocument) {
}

function buildPlayDic_Mount() {
    if (viewer3DMount)
        viewer3DMount.getObjectTree(getObjectTreeCB_Mount);

    var mesh = viewer3DMount.impl.model.getData();
    var frgs = mesh.fragments;
    var frag2dbid = frgs.fragId2dbId;

    var mtx;

    for (i = 0; i < currNodesMount.length; i++) {
        var node = currNodesMount[i];
        //var cc = Array.indexOf(frgs, node.dbId);
        //var cc = $.inArray(node.dbId, frag2dbid);
        //if (i != 1)
        {
            var nodefrags = new Array()
            searchTree(node, nodefrags);
            //if (thisFrags != null)
            {
                var mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, nodefrags[0]).matrixWorld.elements;

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
            //moveaway(viewer3DMount, nodefrags);
        }
    }
}

function cameraChangedEventCB_Mount(evt) {

    if (viewer3DMount) {

        if (ismoving &&
            currentfrgids) {
            ismoving = false;
        }
    }
   
}

function buildPlayDic_Org() {
    if (viewer3DOrg)
        viewer3DOrg.getObjectTree(getObjectTreeCB_Org);
}

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
        //var result = null;
        for (var i = 0; i < element.children.length; i++) {
            searchTree(element.children[i], frags);
        }
        //return result;
    }
    //return null;
}

function getObjectTreeCB_Org(result) {

    geometryItems_children = result.children;

    for (i = 0; i < geometryItems_children.length; i++) {
        {
            allNodesOrg.push(geometryItems_children[i]);
            var thisDbId = geometryItems_children[i];


            if (thisDbId.name == "244752:1" ||
                thisDbId.name == "244752:2" ||
                //thisDbId.name == "51442:1" ||
               thisDbId.name == "237648:1" ||
                thisDbId.name == "47290:1"

                )
                {
                currNodesOrg.push(geometryItems_children[i]);
            }
        }
    }
}

function getObjectTreeCB_Mount(result) {

    geometryItems_children = result.children;

    for (i = 0; i < geometryItems_children.length; i++) {
        {
            var thisDbId = geometryItems_children[i];

            if (thisDbId.name == "244752:1" ||
                thisDbId.name == "244752:2" ||
                //thisDbId.name == "51442:1" ||
               thisDbId.name == "237648:1" ||
                thisDbId.name == "47290:1"

                ) {
                currNodesMount.push(geometryItems_children[i]);
            }
        }
    }
} 

function moveaway(viewer3D, frgid) {

    //if (viewer3D) 
    {

        var camera = viewer3D.getCamera();

        var canvas = document.getElementById("divViewerMount");
        var clientRect = canvas.getBoundingClientRect(); //Canvas is the HTML Canvas of the viewer instance
        var awaylocation = new THREE.Vector2();

        
        awaylocation.x = ((clientRect.right - clientRect.right/10) / window.innerWidth) * 2 - 1;
        awaylocation.y = -((clientRect.top + clientRect.top/10) / window.innerHeight) * 2 + 1;

        var awaylocationvector = new THREE.Vector3(awaylocation.x, awaylocation.y, 0.5);
        projector.unprojectVector(awaylocationvector, camera);
        
        var mtx;
        if (frgid.constructor === Array) {
            for (var i = 0; i < frgid.length; i++) {
                var mtx = viewer3D.impl.getRenderProxy(viewer3D.model, frgid[i]).matrixWorld.elements;
                mtx[12] = awaylocationvector.x;
                mtx[13] = awaylocationvector.y;
                mtx[14] = awaylocationvector.z;

                //mtx[12] += 50;
                //mtx[13] += 50;
                //mtx[14] += 50;
            }
        }
        else {

            var mtx = viewer3D.impl.getRenderProxy(viewer3D.model, frgid).matrixWorld.elements;
            mtx[12] += 1;
            mtx[13] += 1;
            mtx[14] += 1;
        }


        viewer3D.impl.invalidate(true);
    }

}

function onSelectedCallback_Mount(event) {
    var msg = '';
    if (event.dbIdArray.length > 0) {

        //var selFrags = event.event.fragIdsArray;
        //var isMovingFrag = false;
        //if (currentfrgids.constructor === Array) {
        //    for (var eachFrag in currentfrgids) {
        //        for(var eachFrag_1 in selFrags)
        //            if (eachFrag == eachFrag_1) {
        //                isMovingFrag = true;
        //                break;
        //            }
        //        if (isMovingFrag)
        //            break;

        //    }
        //}
        //else {
             
        //}

        //if (!isMovingFrag)
        //    return;

        //node = event.nodeArray[0];        
        ismoving = true;
        var corVs = playDic_pos[currNodesMount[currentIndex].dbId];
       

        stxx = corVs[0];
        styy = corVs[1];
        stzz = corVs[2];

          
    }

}

function isOK() {

    if (viewer3DMount) {
        var mtx;
         if (currentfrgids.constructor === Array) {
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[0]).matrixWorld.elements;
        }
        else {
             mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        }

         var obj = $("#taskdiv");
         if (obj) {

             var diffx = Math.abs(mtx[12] - stxx);
             var diffy = Math.abs(mtx[13] - styy);
             var diffz = Math.abs(mtx[14] - stzz);

               $("#taskdiv")[0].innerHTML = "Diff: (x=" + (Math.round(diffx*100)/100).toString() + ",y=" +
                                (Math.round(diffy * 100) / 100).toString() + ",z=" +
                               (Math.round(diffz * 100) / 100).toString() + ")" + "  click the component, move mouse. press key [Q] to stop the moving.";;
         }

        if (Math.abs(mtx[12] - stxx) < 2.0 &&
            Math.abs(mtx[13] - styy) < 2.0 &&
            Math.abs(mtx[14] - stzz) < 2.0) {
            //alert("Mounted On Succeeded!");
            sound.src = "content/Ring10.wav";
            sound.play();

            $('#alertGoodMount').modal('show');

            ismoving = false;
            currentfrgids = null;

            mtx[12] = stxx;
            mtx[13] = styy;
            mtx[14] = stzz;

            var obj = $("#taskdiv");
            if(obj)
                obj.remove();

        }
    }
}

function moveX(step) {
    
    if (!startMount)
        return;
    var mtx;
    if (currentfrgids.constructor === Array) {
        for (var i = 0; i < currentfrgids.length; i++) {
            mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[i]).matrixWorld.elements;
            mtx[12] += step;
        }
    }
    else {
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        mtx[12] += step;

    }

    viewer3DMount.impl.invalidate(true);

     isOK();
}

function moveY(step) {
    
    if (!startMount)
        return;

    var mtx;
    if (currentfrgids.constructor === Array) {
        for (var i = 0; i < currentfrgids.length; i++) {
            mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[i]).matrixWorld.elements;
            mtx[13] += step;
        }
    }
    else {
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        mtx[13] += step;
    }


    viewer3DMount.impl.invalidate(true);
     isOK();
}

function moveZ(step) {
  
    if (!startMount)
        return;

    var mtx;
    if (currentfrgids.constructor === Array) {
        for (var i = 0; i < currentfrgids.length; i++) {
            mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids[i]).matrixWorld.elements;
            mtx[14] += step;
        }
    }
    else {
        mtx = viewer3DMount.impl.getRenderProxy(viewer3DMount.model, currentfrgids).matrixWorld.elements;
        mtx[14] += step;

    }

    viewer3DMount.impl.invalidate(true);
     isOK();
}