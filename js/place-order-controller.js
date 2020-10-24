/*
*   ================================= GLOBAL VARIABLES ============================================================
* */
var tblOrder = null;
var selectedRow = null;

/*
*   ================================= document.ready() /  window.load() ============================================================
* */
$(function () {
    initializeDataTable();
    loadAllCustomers();
    loadAllItems();
    initializeTextFields();
});

/*
*   ================================= EVENT HANDLERS ============================================================
* */
$("#btn-save").click(addItemToOrder);
$("#tbl-orders tbody").on("click", "tr", selectOrder);
$("#tbl-orders tbody").on("click", "td:last-child", deleteOrderDetail);
$("#btn-clear").click(deselectAllOrders);
$("#btn-placeorder").click(placeOrder);
$("#cmb-custId option").click(loadCustomerName);
$("#cmb-code option").click(loadItemDescription());

/*
*   ================================= FUNCTIONS ============================================================
* */
function initializeDataTable(callbackFn) {
    if (tblOrder != null) {
        tblOrder.destroy();
    }

    if (callbackFn != undefined) {
        callbackFn();
        if ($("#tbl-orders tbody tr").length > 0) {
            $("#tbl-orders tfoot").addClass("d-none");
        } else {
            $("#tbl-orders tfoot").removeClass("d-none");
        }
    }

    tblOrder = $("#tbl-orders").DataTable({
        "ordering": false,
        "lengthChange": false,
        "pageLength": 5,
        "responsive": true,
        "autoWidth": false,
        "info": false,
    });

    //to remove built in empty message in data table
    $("#tbl-orders tr .dataTables_empty").remove();
}

function selectOrder() {
    deselectAllOrders();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("select #cmb-code").val(selectedRow.find("td:first-child").text());
    $("#txt-desc").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-qty").val(selectedRow.find("td:nth-child(3)").text());
    $("#txt-price").val(selectedRow.find("td:nth-child(4)").text());
    $("#txt-id").attr("disabled", true);
    $("#txt-date").attr("disabled", true);
    $("#txt-name").attr("disabled", true);
    // $("#txt-desc").attr("disabled",true);
    $("#txt-qtyOnHand").attr("disabled", true);

}

function addItemToOrder() {
    var code = $("#cmb-code").val();
    var description = $("#txt-desc").val();
    var qty = $("#txt-qty").val();
    var price = $("#txt-price").val();

    var validated = true;

    if (!/\d/.test(qty)) {
        validated = false;
        $("#txt-qty").select();
        $("#txt-address").addClass("is-invalid")
    }

    if (!validated) {
        $("form .is-invalid").tooltip('show');
        return;
    }

    var newRow = "<tr>\n" +
        "                                        <td id='td-code'>" + code + "</td>\n" +
        "                                        <td id='td-description'>" + description + "</td>\n" +
        "                                        <td id='td-qty'>" + qty + "</td>\n" +
        "                                        <td id='td-price'>" + price + "</td>\n" +
        "                                        <td id='td-total'>" + qty * price + "</td>\n" +
        "                                        <td class='bin'><i class=\"fas fa-trash\"></i></td>\n" +
        "                                    </tr>";

    initializeDataTable(function () {
        $('#tbl-orders tbody').append(newRow);
        $("#btn-clear").click();
    })
}

function deselectAllOrders() {
    $("#tbl-orders tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    selectedRow = null;
}

function deleteOrderDetail() {
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
            selectedRow.fadeOut(500, function () {
                initializeDataTable(function () {
                    selectedRow.remove();
                    $("#btn-clear").click();
                    Swal.fire(
                        'Deleted!',
                        'Your file has been deleted.',
                        'success'
                    )
                });
            });
        }
    })
}

function placeOrder() {
    var orderId = $("#txt-id").val();
    var date = $("#txt-date").val();
    var customerId = $("#cmb-custId").val();

    var orderDetails = [];
    var rows = $("#tbl-orders tbody tr");

    for (var i = 1; i <= rows.length; i++) {
        // var code = $("#tbl-orders tbody:nth-child(i)").children("#td-code").text();
        var description;
        var quantity;
        var unitPrice;
        var total;
    }
}

function loadAllCustomers() {
    $.ajax({
        method: 'GET',
        url: "http://localhost:8080/pos/api/v1/customers"
    }).done(function (customers) {
        for (var i = 0; i < customers.length; i++) {
            var id = customers[i].id;
            var newOption = "<option>" + id + "</option>";
            $("#cmb-custId").append(newOption);
        }
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Failed to load the customers!',
            footer: '<a href>Why do I have this issue?</a>'
        })
    })
}

function loadAllItems() {
    $.ajax({
        method: 'GET',
        url: "http://localhost:8080/pos/api/v1/items"
    }).done(function (items) {
        for (var i = 0; i < items.length; i++) {
            var code = items[i].code;
            var newOption = "<option>" + code + "</option>";
            $("#cmb-code").append(newOption);
        }
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Failed to load the customers!',
            footer: '<a href>Why do I have this issue?</a>'
        })
    })
}

function loadCustomerName() {
    $.ajax({
        method: 'GET',
        url: 'http://localhost:8080/pos/api/v1/customers'
    }).done(function (customers) {
        for (var i = 0; i < customers.length; i++) {
            var id = customers[i].id;
            var name = customers[i].name;
            console.log($(this).val());
            if ($(this).val() === id) {
                $("#txt-name").text(name);
            }
        }
    }).fail(function () {
        alert("Something went wrong!");
    })
}

function loadItemDescription() {
    $.ajax({
        method: 'GET',
        url: 'http://localhost:8080/pos/api/v1/items'
    }).done(function (items) {
        for (var i = 0; i < items.length; i++) {
            var code = items[i].code;
            var description = items[i].description;
            if ($("#cmb-custId option").val() === undefined) {
                return;
            } else {
                if ($("#cmb-custId option").val() === code) {
                    $("#txt-name").text(description);
                }
            }
        }
    }).fail(function () {
        alert("Something went wrong!");
    })
}

function initializeTextFields() {
    var date = new Date();
    $("#txt-date").text(date);
}


