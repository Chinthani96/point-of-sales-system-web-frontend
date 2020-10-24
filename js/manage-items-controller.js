/* ===============================================================================================================================================
*  GLOBAL VARIABLES
* ============================================================================================================================================================
* */
var tblItems = null;
var selectedRow = null;

/* ============================================================================================================================================================
*   window.load() / document.ready()
* ============================================================================================================================================================*/
$(function (){
    initializeDataTable(loadAllItems);
})

/* ============================================================================================================================================================
*   EVENT HANDLERS
* ============================================================================================================================================================*/
$("#btn-save").click(saveOrUpdateItem);
$("#txt-id, #txt-desc, #txt-qty, #txt-price").keypress(validationListener);
$("#tbl-items tbody").on("click", "tr", selectItem);
$("#btn-clear").click(deselectAllItems);
$("#tbl-items tbody").on("click","td:nth-child(5)",deleteItems);


/*============================================================================================================================================================
*   FUNCTIONS
* ============================================================================================================================================================*/
function initializeDataTable(callbackFn){
    if (tblItems != null) {
        tblItems.destroy();
    }

    if (callbackFn != undefined) {
        callbackFn();
        if ($("#tbl-items tbody tr").length>0) {
            $("#tbl-items tbody tfoot").addClass("d-none");
        }
        else{
            $("#tbl-items tbody tfoot").removeClass("d-none");
        }
    }

    tblItems = $("#tbl-items").DataTable({
        "ordering" : false,
        "lengthChange" :false,
        "pageLength" :8,
        "responsive": true,
        "autoWidth": false,
    });

    $("#tbl-items tr .dataTables_empty").remove();
}

function saveOrUpdateItem(){
    var id = $("#txt-id").val();
    var desc = $("#txt-desc").val();
    var qty = $("#txt-qty").val();
    var price = $("#txt-price").val();

    var validated = true;

    if (!/\d/.test(price)) {
        validated = false;
        $("#txt-price").select();
        $("#txt-price").addClass("is-invalid");
    }
    if (!/\d/.test(qty)) {
        validated = false;
        $("#txt-qty").select();
        $("#txt-qty").addClass("is-invalid");
    }
    if (!desc.trim().length>0) {
        validated = false;
        $("#txt-desc").select();
        $("#txt-desc").addClass("is-invalid");
    }
    if (!/I\d{3}/.test(id)) {
        validated = false;
        $("#txt-id").select();
        $("#txt-id").addClass("is-invalid");
    }

    if (validated === false) {
        $("form .is-invalid").tooltip('show');
        return;
    }

    if ($("#btn-save").text() === "Update") {
        $.ajax({
            method: "PUT",
            url: "http://localhost:8080/pos/api/v1/items?code="+selectedRow.find("td:first-child").text(),
            data: $("form").serialize()
        }).done(function (){
            selectedRow.find("td:nth-child(2)").text(desc);
            selectedRow.find("td:nth-child(3)").text(qty);
            selectedRow.find("td:nth-child(4)").text(price);
            $("#btn-clear").click();
        }).fail(function (){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to Update the Item!',
                footer: '<a href>Why do I have this issue?</a>'
            })
        })
        return;
    }

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/pos/api/v1/items",
        data: $("form").serialize()
    }).done(function (){
        var newRow = "<tr>\n" +
            "                                        <td>"+id+"</td>\n" +
            "                                        <td>"+desc+"</td>\n" +
            "                                        <td>"+qty+"</td>\n" +
            "                                        <td>"+price+"</td>\n" +
            "                                        <td><i class=\"fas fa-trash\"></i></td>\n" +
            "                                    </tr>";

        initializeDataTable(function (){
            $("#tbl-items tbody").append(newRow);
            $("#btn-clear").click();
        })
    }).fail(function (){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to Save the Item!',
            footer: '<a href>Why do I have this issue?</a>'
        })

    })
}

function validationListener(){
    $(this).removeClass("is-invalid");
    $(this).tooltip("hide");
}

function selectItem(){
    deselectAllItems();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-id").val(selectedRow.find("td:first-child").text());
    $("#txt-desc").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-qty").val(selectedRow.find("td:nth-child(3)").text());
    $("#txt-price").val(selectedRow.find("td:nth-child(4)").text());
    $("#txt-id").attr("disabled",true);
    $("#btn-save").text("Update");
}

function deselectAllItems(){
    $("#tbl-items tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    $("#txt-id").attr("disabled",false);
    selectedRow=null;
}

function deleteItems(){
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                method: 'DELETE',
                url: 'http://localhost:8080/pos/api/v1/items?code='+selectedRow.find("td:first-child").text()
            }).done(function (){
                selectedRow.fadeOut(500,function (){
                    initializeDataTable(function (){
                        selectedRow.remove();
                        $("#btn-clear").click();
                        Swal.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        )
                    });
                });
            }).fail(function (){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Failed to delete Item',
                    footer: '<a href>Why do I have this issue?</a>'
                })
            })
        }
    })
}

function loadAllItems(){
    $.ajax({
        method: "GET",
        url : "http://localhost:8080/pos/api/v1/items"
    }).done(function (items){
        for (var i=0; i<items.length; i++) {
            var code = items[i].code;
            var description = items[i].description;
            var qtyOnHand = items[i].qtyOnHand;
            var unitPrice = items[i].unitPrice;

            var newRow = "<tr>\n" +
                "                                        <td>"+code+"</td>\n" +
                "                                        <td>"+description+"</td>\n" +
                "                                        <td>"+qtyOnHand+"</td>\n" +
                "                                        <td>"+unitPrice+"</td>\n" +
                "                                        <td><i class=\"fas fa-trash\"></i></td>\n" +
                "                                    </tr>";

            initializeDataTable(function(){
                $("#tbl-items").append(newRow);
                $("#btn-clear").click();
            })
        }
    }).fail(function (){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load the Items! Please contact DEP4',
            footer: '<a href>Why do I have this issue?</a>'
        })
        $("#txt-id").select();
    })
}

