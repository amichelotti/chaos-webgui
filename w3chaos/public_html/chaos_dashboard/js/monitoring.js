/*
 * MONITORING CU (STATUS,ALARM)
 */

var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in mag_command.js
var cu_selected = "";
var refresh_time = [];
var old_time = [];
var timestamp_never_called = true;
var refresh_values_never_called = true;
var ok_cu = [];
var n; //numero delle righe (ovvero degli elementi in tabella); così applicando il dataset l'id delle righe aumenta
var cu_cache = {};
var row_2_cu = [];
var row_2_cuid = [];
var str_search = "";
var cu_list=[];
$(document).ready(function () {
    var cu = [];
    var zones = [];
    var classe=["powersupply","scraper"];
    var implementation_map={"powersupply":"SCPowerSupply","scraper":"SCActuator"};

    //Funzione per riempire le select(quella delle zone, e quella degli alimentatori)
    function element_sel(field, arr, add_all) {
        $(field).empty();
        $(field).append("<option>--Select--</option>");
        //$(field).append("<option value='ALL'>ALL</option>");

        if (add_all == 1) {
            $(field).append("<option value='ALL'>ALL</option>");

        }
        $(arr).each(function (i) {
            $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");

        });

    }


    jchaos.search("", "zone", true, function (zones) {
        element_sel('#zones', zones, 1);

    });

    element_sel('#classe',classe,1);

    $("#zones").change(function () {
        zone_selected = $("#zones option:selected").val();
        if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non � selezionata la zona
            $("#elements").attr('disabled', 'disabled');
        } else {
            $("#elements").removeAttr('disabled');
        }
        if (zone_selected == "ALL") {
            jchaos.search("", "class", true, function (ll) {
                element_sel('#elements', ll, 1);
            });

        } else {
            jchaos.search(zone_selected, "class", true, function (ll) {
                element_sel('#elements', ll, 1);
            });
        }

    });


    //Get per prendere i dati delle cu selezionate
    $("#elements").change(function () {
        cu_selected = $("#elements option:selected").val();
        str_search = "";

        if ((zone_selected != "ALL") && (zone_selected != "--Select--")) {
            str_search = zone_selected;
        }
        if ((cu_selected != "ALL") && (cu_selected != "--Select--")) {
            str_search += "/" + cu_selected;
        }


        if (cu_selected == "--Select--" || zone_selected == "--Select--") {
            $(".btn-main-function").hasClass("disabled");

        } else {
            $(".btn-main-function").removeClass("disabled");

        }
        cu_list=jchaos.search(str_search, "cu", true, false);
        var interface=$("#classe option:selected").val();
        
        $('#main-dashboard').chaosDashboard(cu_list, {
                CUtype: implementation_map[interface],
                collapsed: true,
                withQuotes: true,
                Interval: 500

        
        });

        

    }); // *** element list change

    $("#classe").change(function () {
        var interface=$("#classe option:selected").val();
        $('#main-dashboard').chaosDashboard(cu_list, {
            CUtype: implementation_map[interface],
            collapsed: true,
            withQuotes: true,
            Interval: 500 
    });
    });


    var alive;
    $('input[type=radio][name=alive]').change(function () {
        if (this.value == 'true') {

            alive = true;
            jchaos.search(str_search, "cu", alive, function (cu) {
                add_element(cu);
                populate_url(cu);
            });
            console.log("entro");
        } else if (this.value == 'false') {
            alive = false;
            console.log("falso");

            jchaos.search(str_search, "cu", alive, function (cu) {
                add_element(cu);
                $('#cu-dashboard').chaosDashboard(cu, {
                    CUtype: "generic",
                    collapsed: true,
                    withQuotes: true,
                    Interval: 500
    
                });
            });
        }

    });
    /*
     * COMANDI DEI MAGNETI AL CLICK DELLA RIGA I-ESIMA
     */


    var num_row = 0;    //n¡ riga selezionata
    var current;







    function openViewIO() {
        if (!selected_device.hasOwnProperty('health')) {
            return;
        }
        $("#name-cu-io").html(selected_device.health.ndk_uid)

        jchaos.getDesc(selected_device.health.ndk_uid, function (desc) {
            var cutype = "generic";
            if (desc[0].hasOwnProperty('instance_description') && desc[0].instance_description.hasOwnProperty("control_unit_implementation")) {
                var cutype = desc[0].instance_description.control_unit_implementation;

            }
            $('#cu-dashboard').chaosDashboard(selected_device.health.ndk_uid, {
                CUtype: cutype,
                collapsed: true,
                withQuotes: true,
                Interval: 500

            });
        });
        /* jchaos.getDesc(selected_device.health.ndk_uid, function (cu) {
          $('#cu-json-description').jsonViewer(cu,{
              collapsed: true,
              withQuotes: true
      
         });
         });*/
        $("#mdl-io-cu").draggable();
        $("#mdl-io-cu").modal();
    }

   

});   //*** main function

