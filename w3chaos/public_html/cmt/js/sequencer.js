/* JS dedicated to sequencer HTML page.
 * Please include in the HTML page the mag_command.js script
 * and JQuery to obtain the needed functionality
 */

var element = "";
var cmd_str = "";

var wm_cur_id = "cur_val";
var wm_cur_txt = "Ampere";
var wm_wait_id = "wait_val";
var wm_wait_txt = "msec";
var wm_wtcm_id = "local_wait_val";
var wm_wtcm_txt = "msec";

// Shorthand for $( document ).ready()
$(function() {
    addWatermark(wm_cur_id, wm_cur_txt);
    addWatermark(wm_wait_id, wm_wait_txt);
    addWatermark(wm_wtcm_id, wm_wtcm_txt);
});

function addWatermark(fieldId, wmText) {
    $('#' + fieldId).blur(function() {
        if ($(this).val().length == 0) {
            $(this).val(wmText).addClass('CR_Watermark');
        }
    }).focus(function() {
        if ($(this).val() == wmText) {
            $(this).val('').removeClass('CR_Watermark');
        }
    }).val(wmText).addClass('CR_Watermark');
}

/* Clear the textarea field with id="cmds" and the current field
 */
function clearFields() {
    // Clear fields
    $("#cmds").val("");
    $("#" + wm_cur_id).val("");
    $("#" + wm_wait_id).val("");
    addWatermark(wm_cur_id, wm_cur_txt);
    addWatermark(wm_wait_id, wm_wait_txt);
    addWatermark(wm_wtcm_id, wm_wtcm_txt);
}

function enableElements() {
    $(".CR_Ele_Cell").each(function() {
        $(this).addClass("CR_C_Ena");
    });
}

function disableElements() {
    $(".CR_Ele_Cell").each(function() {
        $(this).removeClass("CR_C_Ena");
    });
}

function enableCommands() {
    $(".CR_Cmd_Cell").each(function() {
        $(this).addClass("CR_C_Ena");
    });
}

function disableCommands() {
    $(".CR_Cmd_Cell").each(function() {
        $(this).removeClass("CR_C_Ena");
    });
}

function writeTextarea() {
    var box = $("#cmds");
    // sostuisco il "-" con lo "/"
    cmd_str = cmd_str.replace(/-/g,'/');
    if(box.val() == "" || box.val().substr(box.val().length -1) == "\n") {
        box.val(box.val() + cmd_str);
    } else {
        box.val(box.val() + "\n" + cmd_str);
    }
}

function switchGroup() {
    var id_cr_cmds = $("#CR_Commands");
    var id_cr_elem = $("#CR_Elements");
    var id_cr_curc = $("#CR_Current_Command");
    if(id_cr_cmds.hasClass("CR_G_Sel")) {
        // From commands to elements
        id_cr_elem.addClass("CR_G_Sel");
        id_cr_cmds.removeClass("CR_G_Sel");
        id_cr_curc.removeClass("CR_G_Sel");
    } else {
        // From elements to commands
        id_cr_elem.removeClass("CR_G_Sel");
        id_cr_cmds.addClass("CR_G_Sel");
        id_cr_curc.addClass("CR_G_Sel");
    }
}

/* Append a new command in the textarea field with id="cmds"
 */
function appendCmd(val) {
    // Check if #val is enabled to be clicked
    if($("#" + val).hasClass("CR_C_Ena")) {
        // Remove selected class to the selected element
        $("#" + element).removeClass("CR_C_Sel CR_C_Ena");
        
        // Add enabled class to all Elements
        enableElements();
        
        // Switch group selected
        switchGroup();
        
        // Disable all commands
        disableCommands();
        
        // Create command string
        cmd_str = val + " " + element;
        
        // Write to text area (use cmd_str)
        writeTextarea();
        
        // Clear element and command strings
        element = "";
        cmd_str = "";
    }
}

/* Append a new element in the textarea field with id="cmds"
 */
function appendEle(val) {
    var id_val = $("#" + val);
    // Check if #val is enabled to be clicked
    if(id_val.hasClass("CR_C_Ena")) {
        // Check if this is a selection or a cancel function
        if($("#CR_Elements").hasClass("CR_G_Sel")) {
            // This is a selection
            element = val;
            
            // Remove enabled class to all Elements
            disableElements();
            
            // Add selected and enabled class to the selected element
            id_val.addClass("CR_C_Sel CR_C_Ena");
            
            // Switch group selected
            switchGroup();
            
            // Enable all commands
            enableCommands();
        } else {
            // This is a deselection
            element = "";
            $("#" + wm_cur_id).val("");
            
            // Remove selected class to the selected element
            id_val.removeClass("CR_C_Sel CR_C_Ena");
            
            // Add enabled class to all Elements
            enableElements();
            
            // Switch group selected
            switchGroup();
            
            // Disable all commands
            disableCommands();
        }
    }
}

/* Append the current value in the textarea field with id="cmds",
 * taken from the text field with id="cur_val"
 */
function appendCurrent(val) {
    // Check if #val is enabled to be clicked
    if($("#" + val).hasClass("CR_C_Ena")) {
        var id_wm_cur = $("#" + wm_cur_id);
        // Remove selected class to the selected element
        $("#" + element).removeClass("CR_C_Sel CR_C_Ena");
        
        // Add enabled class to all Elements
        enableElements();
        
        // Switch group selected
        switchGroup();
        
        // Disable all commands
        disableCommands();
        
        // Create command string
        cmd_str = "SETT " + element + " " + id_wm_cur.val();
        
        // Write to text area (use cmd_str)
        writeTextarea();
        
        // Clear element, current and command strings
        id_wm_cur.val("");
        addWatermark(wm_cur_id, wm_cur_txt);
        element = "";
        cmd_str = "";
    }
}

/* Append the wait value in the textarea field with id="cmds",
 * taken from the text field with id="wait_val"
 */
function appendWait(val) {
    var id_wm_wait = $("#" + wm_wait_id);
    // Check if #val is enabled to be clicked
    if($("#" + val).hasClass("CR_C_Ena")) {
        // Remove selected class to the selected element
        $("#" + element).removeClass("CR_C_Sel CR_C_Ena");
        
        // Add enabled class to all Elements
        enableElements();
        
        // Switch group selected
        switchGroup();
        
        // Disable all commands
        disableCommands();
        
        // Create command string
        cmd_str = "WAIT " + element + " " + id_wm_wait.val();
        
        // Write to text area (use cmd_str)
        writeTextarea();
        
        // Clear element, current and command strings
        id_wm_wait.val("");
        addWatermark(wm_wait_id, wm_wait_txt);
        element = "";
        cmd_str = "";
    }
}

/* Append the local wait value in the textarea field with id="cmds",
 * taken from the text field with id="local_wait_val"
 */
function appendWtcm() {
    var id_wm_wtcm = $("#" + wm_wtcm_id);
    // Create command string
    cmd_str = "WTCM " + id_wm_wtcm.val();

    // Write to text area
    writeTextarea();

    // Clear element, current and command strings
    id_wm_wtcm.val("");
    addWatermark(wm_wtcm_id, wm_wtcm_txt);
}


function sendCmdList(cmd_list, delay, rest) {
    var id_res = $("#results");
    var br = "<br/>";
    if (cmd_list.length == 0 && rest.length == 0) {
        // the function has been called empty
        id_res.append("Ended" + br);
        return;
    }
    // Do Command List
    $.each(cmd_list, function(cmdNumber, cmd) {
        id_res.append(cmd + br);
        var cmdArray = cmd.split(' ');
        //url = "http://" + location.host + ":8081/CU?dev=BTF/" + cmdArray[1];
        url = request_prefix + cmdArray[1];
        device = cmdArray[1];
        
        console.log("device " + device);
        
       /* if (device.split("",1) == 'D'){
            cmdArray[1] = "BTF/DIPOLE/" + cmdArray[1];
        }
        
        if (device.split("",1) == 'Q'){
            cmdArray[1] = "BTF/QUADRUPOLE/" + cmdArray[1];
        }        
        
        if (device.split("",1) == 'C'){
            cmdArray[1] = "BTF/CORRECTOR/" + cmdArray[1];
        } 
        
        //cmdArray[1] = "BTF/DIPOLE/" + cmdArray[1];
        
        url = request_prefix + cmdArray[1]; */


        
       
        
        console.log("device " + device);
        switch (cmdArray[0]) {
            case "POWR":
                console.log("Power on " + cmdArray[1]);
                setPowerSupply("On");
                break;
            case "STBY":
                console.log("Put in Standby " + cmdArray[1]);
                setPowerSupply("Standby");
                break;
            case "POLA_P":
                console.log("Set Positive Polarity on " + cmdArray[1]);
                setPolarity("Pos");
                break;
            case "POLA_O":
                console.log("Set Open Polarity on " + cmdArray[1]);
                setPolarity("Open");
                break;
            case "POLA_N":
                console.log("Set Negative Polarity on " + cmdArray[1]);
                setPolarity("Neg");
                break;
            case "SETT":
                console.log("Set " + cmdArray[1] + " to " + cmdArray[2] + " A");
                setCurrent(cmdArray[2]);
                break;
            case "RESE":
                console.log("Reset alarms on " + cmdArray[1]);
                resetAlarm("Reset");
                break;
            case "WAIT":
                console.log("Send a wait command to " + cmdArray[1] + " of " + cmdArray[2] + " ms");
                setWait(cmdArray[2]);
                break;
            default:
                console.log("Unsupported command: " + cmd);
        }
    });

    //Analyze rest and apply delay
    setTimeout(function() {
        var new_cmd_list = [];
        var new_rest = [];
        var new_delay = 0;
        var wait_found = false;
        $.each(rest, function(cmdNumber, cmd) {
            if (wait_found) {
                // put every command in new rest
                new_rest.push(cmd);
            } else {
                if (cmd.indexOf("WTCM") !== -1) {
                    // found here
                    wait_found = true;
                    var cmdArray = cmd.split(' ');
                    new_delay = cmdArray[1];
                } else {
                    // not found local wait command
                    new_cmd_list.push(cmd);
                }
            }
        });
        sendCmdList(new_cmd_list, new_delay, new_rest);
    }, delay);
}

function sendCmds() {
    var id_res = $("#results");
    id_res.html("<br/>Commands sent:<br/><br/>");
    var cmd_list = [];
    var delay = 0;
    // Loop on each row
    var rest = $("#cmds").val().split('\n');
    // Send commands
    sendCmdList(cmd_list, delay, rest);
    clearFields();
}