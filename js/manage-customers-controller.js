//========================================================================================
/*                     Global variables                                                */
//========================================================================================
var tblCustomers = null;
var selectedRow = null;

/* document.ready() AND window.load()*/
$(function () {
    initializeDataTable(loadAllCustomers);
});

/* =======================================================================================
*                      Event Handlers
* =======================================================================================*/
$("#tbl-customers tbody").on("click", "tr", selectCustomer);
$("#btn-clear").click(deselectAllCustomers);
$("#btn-save").click(saveOrUpdateCustomer);
$("#tbl-customers tbody").on("click","td:nth-child(4)",deleteCustomer);
$("#txt-id, #txt-name, #txt-address").keypress(validationListener);


/* =======================================================================================
*                      Functions
* =======================================================================================*/

function saveOrUpdateCustomer() {
    var id = $("#txt-id").val();
    var name = $("#txt-name").val();
    var address = $("#txt-address").val();

    var validated = true;

    if (address.trim().length < 3) {
        $("#txt-address").select();
        $("#txt-address").addClass("is-invalid")
        validated = false;
    }

    if (!/[A-Za-z ]{3,}/.test(name)) {
        $("#txt-name").select();
        $("#txt-name").addClass("is-invalid")
        validated = false;
    }

    if (!/^C\d{3}$/.test(id)) {
        $("#txt-id").select();
        $("#txt-id").addClass("is-invalid")
        validated = false;
    }

    if (!validated) {
        $("form .is-invalid").tooltip('show');
        return;
    }

    if ($("#btn-save").text() === "Update") {
        $.ajax({
            method: "PUT",
            url: "http://localhost:8080/pos/api/v1/customers?id=" +selectedRow.find("td:first-child").text(),
            // contentType: "application/json",
            data: $("form").serialize()
        }).done(function(){
            selectedRow.find("td:nth-child(2)").text(name);
            selectedRow.find("td:nth-child(3)").text(address);
            $("#btn-clear").click();
        }).fail(function (){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Failed to update Customer',
                footer: '<a href>Why do I have this issue?</a>'
            })
            $("#txt-id").select();
        })
        return;
    }

    /* 1. create an XMLHTTPRequest object*/
    var xmlHttpRequest = new XMLHttpRequest();

    /* 2. Async callback function (after the response is received)*/
    $.ajax({
        method: "POST",
        url: "http://localhost:8080/pos/api/v1/customers",
        // contentType: "application/json",
        data: $("form").serialize()
    }).done(function (){
        var newRow = "<tr>\n" +
                        "                                        <td>" + id + "</td>\n" +
                        "                                        <td>" + name + "</td>\n" +
                        "                                        <td>" + address + "</td>\n" +
                        "                                        <td class='bin'><i class=\"fas fa-trash\"></i></td>\n" +
                        "                                    </tr>";

                    initializeDataTable(function () {
                        $('#tbl-customers tbody').append(newRow);
                        $("#btn-clear").click();
                    })
    }).fail(function (){
        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Something went wrong!',
                            footer: '<a href>Why do I have this issue?</a>'
                        })
                        $("#txt-id").select();
    })
}

function selectCustomer() {
    deselectAllCustomers();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-id").val(selectedRow.find("td:first-child").text());
    $("#txt-name").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-address").val(selectedRow.find("td:nth-child(3)").text());
    $("#txt-id").attr("disabled",true);
    $("#btn-save").text("Update");

}

function initializeDataTable(callbackFn) {
    if (tblCustomers != null) {
        tblCustomers.destroy();
    }

    if (callbackFn != undefined) {
        callbackFn();
        if ($("#tbl-customers tbody tr").length > 0) {
            $("#tbl-customers tfoot").addClass("d-none");
        }
        else{
            $("#tbl-customers tfoot").removeClass("d-none");
        }
    }

    tblCustomers = $("#tbl-customers").DataTable({
        "ordering": false,
        "lengthChange": false,
        "pageLength": 5,
        "responsive": true,
        "autoWidth": false,
        "info": false,
    });

    //to remove built in empty message in data table
    $("#tbl-customers tr .dataTables_empty").remove();

}

function deselectAllCustomers(){
    $("#tbl-customers tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    $("#txt-id").attr("disabled",false);
    selectedRow=null;
}

function deleteCustomer(){
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
                method: "DELETE",
                url: 'http://localhost:8080/pos/api/v1/customers?id='+selectedRow.find("td:first-child").text()
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
                    text: 'Something went wrong! Failed to delete Customer',
                    footer: '<a href>Why do I have this issue?</a>'
                })
            })
        }
    })
}

function validationListener(){
    $(this).removeClass("is-invalid");
    $(this).tooltip("hide");
}

function removeAllValidations(){
    $("#txt-id, #txt-name, #txt-address").removeClass("is-invalid");
    $("#txt-id, #txt-name, #txt-address").tooltip("hide");
}

// plain text method
function loadAllCustomers_STRING(){
    $.ajax({
        method: 'GET',
        url : 'http://localhost:8080/pos/api/v1/customers'
    }).done(function (data){
        console.log(data)
    }).fail(function (){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please contact DEP4',
            footer: '<a href>Why do I have this issue?</a>'
        })
        $("#txt-id").select();
    })
}

function loadAllCustomers(){
    $.ajax({
        method: 'GET',
        url : 'http://localhost:8080/pos/api/v1/customers'
    }).done(function (customers){
        for (var i =0; i<customers.length; i++) {
            var id = customers[i].id;
            var name = customers[i].name;
            var address = customers[i].address;

            var newRow = "<tr>\n" +
                "                                        <td>" + id + "</td>\n" +
                "                                        <td>" + name + "</td>\n" +
                "                                        <td>" + address + "</td>\n" +
                "                                        <td class='bin'><i class=\"fas fa-trash\"></i></td>\n" +
                "                                    </tr>";

            initializeDataTable(function () {
                $('#tbl-customers tbody').append(newRow);
                $("#btn-clear").click();
            })
        }
    }).fail(function (){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please contact DEP4',
            footer: '<a href>Why do I have this issue?</a>'
        })
        $("#txt-id").select();
    })
}
