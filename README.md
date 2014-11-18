#Client sample - mount simulation

##Description

*This sample is part of the [Developer-Autodesk/Autodesk-View-and-Data-API-Samples](https://github.com/Developer-Autodesk/autodesk-view-and-data-api-samples) repository.*

A sample simulates the process of mounting the component with Autodesk Viewer. This is a scenario that test the knowledge of engineers e.g. car mechanics, etc., to see if they understand how a given part fits into the whole things. 

##Dependencies

* Get your consumer key and secret key at https://developer.autodesk.com/
* Provide the key and secret in Web.config file
* You need other workflow samples to log in, upload a model file, start translation to get required parameters (urn) for this demo
* Provide the URN and the bucket name in Web.config file

##Setup/Usage Instructions

* Load the web page, wait the view loads the model (mounting page)
* click the arrow of top-right corner to switch to another page (original page) which activates another view.
switch back to mounting page.
* select some objects (components) you want to do simulation. Click [Select Objects]
* click [Mount on]: mounting starts. The selected components will be moved aside and be invisible. The first mounting component will be visible.
* Click the component, and move mouse, the component will move accordingly. Try to move closer to the correct position of the component. If the user is not clear, he can switch to original page. The mounting component will be highlighted in its original position.
* Click keyboard [Q] to pause a moving any time. Click component again, and the moving will start again.
* The info about the different distance will be shown on the top-left corner. If the moving is much close to the correct position, click [MoveX+], [MoveX-]  etc to tune the position.
* If the difference distance is less than a tolerance, a dialog will pop out to indicate this mounting succeeds
* Click [Next Comp] to start the next mounting for next component.
* Click [Mount Off] to exit mounting and reload the model.


 Please refer to the video [MountSimulation.mp4](https://github.com/Developer-Autodesk/client-mountsimulation-view.and.data.api/blob/master/MountSimulation.mp4) for a demo of the detailed workflow. 

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

##Written by 

Xiaodong Liang
