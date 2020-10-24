/*
* =======================================   Global Variables ======================================================
* */
var tblSearchOrder = null;

/*
* =======================================   Document.ready and window.load ======================================================
* */

$(function(){
    initializeDataTable();
    loadAllOrders();
})

/*
* =======================================   Event handlers ======================================================
* */


/*
* =======================================   Functions    ======================================================
* */

function initializeDataTable(callbackFn){
    if (tblSearchOrder != null) {
        tblSearchOrder.destroy();
    }

    if (callbackFn != undefined) {
        callbackFn();
        if ($("#tbl-searchorder tbody tr").length > 0) {
            $("#tbl-searchorder tfoot").addClass("d-none");
        }
        else{
            $("#tbl-searchorder tfoot").removeClass("d-none");
        }
    }

    tblSearchOrder = $("#tbl-searchorder").DataTable({
        "ordering": false,
        "lengthChange": false,
        "pageLength": 5,
        "responsive": true,
        "autoWidth": false,
        "searching": true,
        "info": false,
    });

    //to remove built in empty message in data table
    $("#tbl-searchorder tr .dataTables_empty").remove();
}

function loadAllOrders(){
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/pos/api/v1/order-details"
    }).done(function (orders){
        for (var i=0; i<orders.length; i++) {
            var id = orders[i].id;
            var date = orders[i].date;
            var customerId = orders[i].customerId;
            var customerName = "name";
            var total = 50.00;

            var newRow = " <tr>\n" +
                "                                                                        <td>"+id+"</td>\n" +
                "                                                                        <td>"+date+"</td>\n" +
                "                                                                        <td>"+customerId+"</td>\n" +
                "                                                                        <td>"+customerName+"</td>\n" +
                "                                                                        <td>"+total+"</td>\n" +
                "                                                                    </tr>"

            initializeDataTable(function () {
                $('#tbl-searchorder tbody').append(newRow);
                $("#btn-clear").click();
            })

        }
    }).fail(function(){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please contact DEP4',
            footer: '<a href>Why do I have this issue?</a>'
        })
    })
}
