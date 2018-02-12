"use strict";

// Initialize Firebase

var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

var db = firebase.database();
var auth = firebase.auth();
var agenteAsignado = "";

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarPedidos();
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

$('#pestañaPedidos').on('shown.bs.tab', function (e) {
  mostrarPedidos();
  $('#botonCollapse').attr({
    'data-target': '#collapse1',
    'aria-controls': 'collapse1'
  });
});

$('#pestañaOrdenesCompra').on('shown.bs.tab', function (e) {
  mostrarOrdenesCompra();
  $('#botonCollapse').attr({
    'data-target': '#collapse2',
    'aria-controls': 'collapse2'
  });
});

function mostrarOrdenesCompra() {
  var hola = $("#tablaOrdenesCompra").DataTable({
    "oLanguage": { "sSearch": '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>' },
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json",
      "searchPlaceholder": "Buscar"
    },

    "ordering": false
  });

  var ordenesCompraRef = db.ref('ordenesCompra/');
  ordenesCompraRef.on('value', function (snapshot) {
    var pedidos = snapshot.val();
    tabla.clear();
    var filas = "";
    var arreglo = [],
        arregloID = [];
    for (var pedido in pedidos) {
      arreglo.push(pedidos[pedido]);
      arregloID.push(pedido);
    }
    arreglo.reverse();
    arregloID.reverse();

    $('#tablaPedidos tbody').empty();
    for (var _pedido in arreglo) {
      var estado = "";
      switch (arreglo[_pedido].encabezado.estado) {
        case "Pendiente":
          estado = "<td class=\"no-padding text-center\"><i style=\"color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;\" class=\"material-icons center\">fiber_manual_record</i></td>";
          break;
        case "En proceso":
          estado = "<td class=\"no-padding text-center\"><i style=\"color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;\" class=\"material-icons center\">fiber_manual_record</i></td>";
          break;
        case "Lista":
          estado = "<td class=\"no-padding text-center\"><i style=\"color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;\" class=\"material-icons center\">fiber_manual_record</i></td>";
          break;
      }

      var diaCaptura = arreglo[_pedido].encabezado.fechaCaptura.substr(0, 2);
      var mesCaptura = arreglo[_pedido].encabezado.fechaCaptura.substr(3, 2);
      var añoCaptura = arreglo[_pedido].encabezado.fechaCaptura.substr(6, 4);
      var fechaCaptura = mesCaptura + "/" + diaCaptura + "/" + añoCaptura;
      moment.locale('es');
      var fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      filas += "<tr style=\"padding:0px 0px 0px;\" class=\"no-pading\">\n                  <td>" + arregloID[_pedido] + "</td>\n                  <td>" + fechaCapturaMostrar + "</td>\n                  <td>" + arreglo[_pedido].encabezado.tienda + "</td>\n                  <td>" + arreglo[_pedido].encabezado.ruta + "</td>\n                  <td class=\"no-padding text-center\"><a href=\"orden.html?id=" + arregloID[_pedido] + "\" class=\"btn btn-default btn-sm\"><span style=\"padding-bottom:0px;\" class=\"glyphicon glyphicon-eye-open\"></span> Ver m\xE1s</a></td>\n                  " + estado + "\n                  <td class=\"text-center\"><button type=\"button\" class=\"btn btn-danger btn-sm\" onclick=\"abrirModalEliminarOrden('" + arregloID[_pedido] + "')\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></button></td>\n                </tr>";
    }

    $('#loaderPedidos').remove();
    $('#tablaPedidos').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarPedidos() {
  var tabla = $("#tablaPedidos").DataTable({
    "oLanguage": { "sSearch": '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>' },
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json",
      "searchPlaceholder": "Buscar"
    },
    "ordering": false
  });

  var pedidosEntradaRef = db.ref('pedidoEntrada/');
  pedidosEntradaRef.on('value', function (snapshot) {
    var pedidos = snapshot.val();
    tabla.clear();
    var filas = "";
    var arreglo = [],
        arregloID = [];
    for (var pedido in pedidos) {
      var agrupado = pedidos[pedido].encabezado.agrupado;
      console.log(agrupado);
      if (typeof agrupado != "undefined" && agrupado == true) {
        console.warn("TIGREEEE!");
        arreglo.unshift(pedidos[pedido]);
        arregloID.unshift(pedido);
      }
    }
    // arreglo.reverse();
    // arregloID.reverse();

    for (var _pedido2 in arreglo) {
      var estado = "";
      switch (arreglo[_pedido2].encabezado.estado) {
        case "Pendiente":
          //estado = `<td class="no-padding text-center"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          estado = "<td class=\"no-padding text-center\"><span style=\"background-color:#d50000; color:#FFFFFF;\" class=\"badge\">Pendiente</span></td>";
          break;
        case "En proceso":
          estado = "<td class=\"no-padding text-center\"><i style=\"color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;\" class=\"material-icons center\">fiber_manual_record</i></td>";
          break;
        case "Lista":
          estado = "<td class=\"no-padding text-center\"><i style=\"color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;\" class=\"material-icons center\">fiber_manual_record</i></td>";
          break;
      }

      var encabezado = arreglo[_pedido2].encabezado;

      var diaCaptura = encabezado.fechaCaptura.substr(0, 2);
      var mesCaptura = encabezado.fechaCaptura.substr(3, 2);
      var añoCaptura = encabezado.fechaCaptura.substr(6, 4);
      var fechaCaptura = mesCaptura + "/" + diaCaptura + "/" + añoCaptura;
      moment.locale('es');
      var fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      var numeroOrden = encabezado.numOrden || "";
      // ${(encabezado.numOrden != undefined) ? encabezado.numOrden : "" }

      filas += "<tr style=\"padding:0px 0px 0px;\" class=\"no-pading\">\n                  <td>" + arregloID[_pedido2] + "</td>\n                  <td>" + encabezado.clave + "</td>\n                  <td>" + numeroOrden + "</td>\n                  <td>" + fechaCapturaMostrar + "</td>\n                  <td>" + encabezado.tienda + "</td>\n                  <td>" + encabezado.ruta + "</td>\n                  <td class=\"no-padding text-center\"><a href=\"pedido.html?id=" + arregloID[_pedido2] + "\" class=\"btn btn-default btn-sm\"><span class=\"glyphicon glyphicon-eye-open\"></span> Ver m\xE1s</a></td>\n                  " + estado + "\n                  <td class=\"text-center\"><button type=\"button\" class=\"btn btn-danger btn-sm\" onclick=\"abrirModalEliminarPedido('" + arregloID[_pedido2] + "')\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></button></td>\n                </tr>";
    }

    $('#loaderPedidos').remove();
    $('#tablaPedidos').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function abrirModalEliminarPedido(idPedido) {
  $('#modalConfirmarEliminarPedido').modal('show');
  $('#btnConfirmar').attr('onclick', "eliminarPedido(\"" + idPedido + "\")");
}

function eliminarPedido(idPedido) {
  db.ref('pedidoEntrada').child(idPedido).remove();
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: "El pedido " + idPedido + " fue eliminado con exito" });
}

function abrirModalEliminarOrden(idOrden) {
  $('#modalConfirmarEliminarOrden').modal('show');
  $('#btnConfirmarOrden').attr('onclick', "eliminarOrden(\"" + idOrden + "\")");
}

function eliminarOrden(idOrden) {
  db.ref('ordenesCompra').child(idOrden).remove();
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: "La orden " + idOrden + " fue eliminada con exito" });
}

function mostrarHistorialPedidos() {
  var tabla = $("#tablaHistorialPedidos").DataTable({
    destroy: true,
    // "scrollY": "300px",
    // "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

  var historialPedidosRef = db.ref('historialPedidosEntrada/');
  historialPedidosRef.on('value', function (snapshot) {
    var pedidos = snapshot.val();
    tabla.clear();
    var filas = "";
    var arreglo = [],
        arregloID = [];
    for (var pedido in pedidos) {
      if (pedidos[pedido].encabezado.agrupado) {
        arreglo.push(pedidos[pedido]);
        arregloID.push(pedido);
      }
    }
    arreglo.reverse();
    arregloID.reverse();

    for (var _pedido3 in arreglo) {

      var encabezado = arreglo[_pedido3].encabezado;

      var diaCaptura = encabezado.fechaCaptura.substr(0, 2);
      var mesCaptura = encabezado.fechaCaptura.substr(3, 2);
      var añoCaptura = encabezado.fechaCaptura.substr(6, 4);
      var fechaCaptura = mesCaptura + "/" + diaCaptura + "/" + añoCaptura;
      moment.locale('es');
      var fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      filas += "<tr style=\"padding:0px 0px 0px;\" class=\"no-pading\">\n                  <td>" + arregloID[_pedido3] + "</td>\n                  <td>" + (encabezado.numOrden != undefined ? encabezado.numOrden : "") + "</td>\n                  <td>" + fechaCapturaMostrar + "</td>\n                  <td>" + encabezado.tienda + "</td>\n                  <td>" + encabezado.ruta + "</td>\n                  <td class=\"no-padding text-center\"><a href=\"pedidoHistorial.html?id=" + arregloID[_pedido3] + "\" class=\"btn btn-default btn-sm\"><span class=\"glyphicon glyphicon-eye-open\"></span> Ver m\xE1s</a></td>\n                </tr>";
    }

    $('#loaderPedidos').remove();
    $('#tablaPedidos').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function guardarFechaRuta(idPedidoPadre) {
  var pedidoPadreRef = db.ref("pedidoPadre/" + idPedidoPadre);
  var nuevaFechaRuta = $("#fechaRuta-" + idPedidoPadre).val();
  pedidoPadreRef.update({
    fechaRuta: nuevaFechaRuta
  });
}

function guardarRuta(idPedidoPadre) {
  var pedidoPadreRef = db.ref("pedidoPadre/" + idPedidoPadre);
  var nuevaRuta = $("#ruta-" + idPedidoPadre).val();
  console.log(idPedidoPadre);
  pedidoPadreRef.update({
    ruta: nuevaRuta
  });
}

function mostrarPedidosEnProceso() {
  var tabla = $("#tablaPedidosEnProceso").DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

  var pedidosPadreRef = db.ref('pedidoPadre');
  pedidosPadreRef.on('value', function (snapshot) {
    var loader = $('#loaderPedidosEnProceso');
    var pedidosPadre = snapshot.val();
    if (pedidosPadre == null || pedidosPadre == undefined) {
      loader.remove();
      $('#pPedidosProceso').html('No se encontraron pedidos en proceso');
    }
    var filas = "";
    tabla.clear();
    for (var pedidoPadre in pedidosPadre) {
      if (pedidosPadre[pedidoPadre].estado == "En proceso") {
        var diaCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(0, 2);
        var mesCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(3, 2);
        var añoCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(6, 4);
        var fechaCaptura = mesCaptura + "/" + diaCaptura + "/" + añoCaptura;
        moment.locale('es');

        var fechaCapturaMostrar = moment(fechaCaptura).format('LL');

        var fechaRutaMostrar = void 0;
        var rutaMostrar = void 0;
        if (pedidosPadre[pedidoPadre].fechaRuta.length > 0) {
          var diaRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(0, 2);
          var mesRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(3, 2);
          var añoRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(6, 4);
          var fechaRuta = mesRuta + "/" + diaRuta + "/" + añoRuta;

          fechaRutaMostrar = moment(fechaRuta).format('LL');
        } else {
          fechaRutaMostrar = "Fecha pendiente";
        }
        if (pedidosPadre[pedidoPadre].ruta.length == 0) {
          rutaMostrar = "Ruta pendiente";
        } else {
          rutaMostrar = pedidosPadre[pedidoPadre].ruta;
        }

        filas += "<tr>\n                    <td>" + pedidosPadre[pedidoPadre].clave + "</td>\n                    <td>" + fechaCapturaMostrar + "</td>\n                    <td>" + fechaRutaMostrar + "</td>\n                    <td>" + rutaMostrar + "</td>\n                    <td class=\"text-center\">" + (typeof pedidosPadre[pedidoPadre].agente != "undefined" ? '<div class="radioBtn btn-group"><a class="btn btn-sm btn-agente">' + pedidosPadre[pedidoPadre].agente + '</a></div>' : "") + "</td>\n                    <td class=\"text-center\"><button onclick=\"abrirModalModificarRuta('" + pedidoPadre + "')\" class=\"btn btn-warning btn-sm\"><i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i></button></td>\n                    <td class=\"text-center\">\n                      <span style=\"background-color:#FFCC25; color:#000000;\" class=\"badge\">En proceso</span>\n                    </td>\n                    <td class=\"text-center\"><a class=\"btn btn-default btn-sm\" href=\"pedidoPadre.html?id=" + pedidoPadre + "\"><span class=\"glyphicon glyphicon-eye-open\"></span> Ver m\xE1s</a></td>\n                    <td class=\"text-center\"><button onclick=\"abrirModalSeparar('" + pedidoPadre + "')\" class=\"btn btn-danger btn-sm\"><i class=\"fa fa-arrows-h\" aria-hidden=\"true\"></i></button></td>\n                    <td class=\"text-center\"><button onclick=\"verificarPedidoPadre('" + pedidoPadre + "')\" class=\"btn btn-primary btn-sm\"><span class=\"glyphicon glyphicon-list-alt\" aria-hidden=\"true\"></span></button></td>\n                    <td class=\"text-center\"><button class=\"btn btn-success btn-sm\" onclick=\"abrirModalFinalizarPedidoPadre('" + pedidoPadre + "')\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></button></td>\n                  </tr>";

        /*filas += `<tr>
                    <td>${pedidosPadre[pedidoPadre].clave}</td>
                    <td>${fechaCapturaMostrar}</td>
                    <td>${fechaRutaMostrar}</td>
                    <!--<td class="text-center">
                      <form class="form-inline">
                        <div class="form-group">
                          <div class="input-group date" style="width: 200px;">
                            <input class="form-control input-sm" type="text" placeholder="Fecha de ruta" id="fechaRuta-${pedidoPadre}">
                            <span style="color: white;" class="input-group-addon btn-primary btn-sm"><i class="fa fa-calendar"></i></span>
                          </div>
                        </div>
                        <button class="btn btn-success btn-sm" type="button" onclick="guardarFechaRuta('${pedidoPadre}')"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
                      </form>
                    </td>-->
                    <td>${rutaMostrar}</td>
                    <!--<td class="text-center">
                      <div class="form-group">
                        <div class="input-group" style="width: 200px;">
                          <input class="form-control input-sm" type="text" style="" placeholder="Ruta" id="ruta-${pedidoPadre}"/>
                          <span class="input-group-btn"><button class="btn btn-success btn-sm" onclick="guardarRuta(${pedidoPadre})"><i class="fa fa-floppy-o" aria-hidden="true"></i></button></span>
                        </div>
                      </div>
                    </td>-->
                    <td class="text-center"><button onclick="abrirModalModificarRuta('${pedidoPadre}')" class="btn btn-warning btn-sm">Modificar</button></td>
                    <td class="text-center">
                      <i style="color:#FFCC25; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i>
                    </td>
                    <td class="text-center"><a class="btn btn-default btn-sm" href="pedidoPadre.html?id=${pedidoPadre}"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
                  </tr>`;*/
      }
    }
    $('#pPedidosProceso').remove();
    $('#loaderPedidosEnProceso').remove();
    $('#tablaPedidosEnProceso').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();

    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}

dragula([document.getElementById('tbodyTablaPedidoSeparar'), document.getElementById('tbodyTablaPedidoSeparado')]);

function abrirModalSeparar(idPedidoPadre) {
  var tabla = $("#tablaPedidoSeparar").DataTable({
    destroy: true,
    language: {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    searching: false,
    scrollY: "200px",
    ordering: false,
    paging: false,
    info: false,
    responsive: true
  });

  var rutaPedidoPadre = db.ref("pedidoPadre/" + idPedidoPadre);
  rutaPedidoPadre.on('value', function (snapshot) {
    var pedidosHijos = snapshot.val().pedidosHijos;

    var filas = "";
    tabla.clear();
    for (var pedido in pedidosHijos) {
      filas += "<tr>\n                  <td>" + pedido + "</td>\n                  <td>" + pedidosHijos[pedido].encabezado.numOrden + "</td>\n                  <td>" + pedidosHijos[pedido].encabezado.fechaCaptura + "</td>\n                  <td>" + pedidosHijos[pedido].encabezado.tienda + "</td>\n                  <td>" + pedidosHijos[pedido].encabezado.ruta + "</td>\n                </tr>";
    }
    tabla.rows.add($(filas)); //columns.adjust().draw();
  });

  $('#modalSeparar').modal('show');
  $('#btnSeparar').attr('onclick', "separar('" + idPedidoPadre + "')");
}

$('#modalSeparar').on('shown.bs.modal', function () {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

function separar(idPedidoPadre) {
  var pedidos = [],
      claves = [],
      datosNuevoPedidoPadre,
      pedidosHijos = {},
      productosRepetidos = [],
      productosNoRepetidos = [];
  var rutaPedidoPadre = db.ref("pedidoPadre/" + idPedidoPadre);

  $("#tablaPedidoSeparado tbody tr").each(function (i) {
    var clave;
    $(this).children("td").each(function (j) {
      if (j == 0) {
        if ($(this).text().length > 0) {
          clave = $(this).text();
          claves.push(clave);

          var pedidoEntradaRef = db.ref("pedidoPadre/" + idPedidoPadre + "/pedidosHijos/" + clave + "/");
          pedidoEntradaRef.once('value', function (snapshot) {
            var pedidoHijo = snapshot.val();
            pedidosHijos[clave] = pedidoHijo;
          });
        }
      }
    });

    if ($(this).attr('id') != "filavacia") {
      var pedidoRef = db.ref("pedidoPadre/" + idPedidoPadre + "/pedidosHijos/" + clave);
      pedidoRef.once('value', function (snapshot) {
        var pedido = snapshot.val();
        pedidos.push(pedido);

        var detalle = pedido.detalle;
        for (var producto in detalle) {
          var datosProducto = {
            claveConsorcio: detalle[producto].claveConsorcio,
            clave: detalle[producto].clave,
            precioUnitario: detalle[producto].precioUnitario,
            nombre: detalle[producto].nombre,
            degusPz: detalle[producto].degusPz,
            degusKg: detalle[producto].degusKg,
            pedidoPz: detalle[producto].pedidoPz,
            pedidoKg: detalle[producto].pedidoKg,
            totalKg: detalle[producto].totalKg,
            totalPz: detalle[producto].totalPz,
            unidad: detalle[producto].unidad,
            cambioFisicoPz: detalle[producto].cambioFisicoPz,
            cambioFisicoKg: detalle[producto].cambioFisicoKg
          };

          productosRepetidos.push(datosProducto);
        }
      });
    }
  });

  for (var i in productosRepetidos) {
    if (productosNoRepetidos.length == 0) {
      productosNoRepetidos.push(productosRepetidos[i]);
    } else {
      var bandera = false;
      for (var j in productosNoRepetidos) {

        if (productosRepetidos[i].clave == productosNoRepetidos[j].clave) {
          bandera = true;

          var productoNoRepetido = productosNoRepetidos[j];
          var productoRepetido = productosRepetidos[i];

          productoNoRepetido.totalKg = productoNoRepetido.totalKg + productoRepetido.totalKg;
          productoNoRepetido.totalPz = productoNoRepetido.totalPz + productoRepetido.totalPz;
        }
      }
      if (bandera == false) {
        productosNoRepetidos.push(productosRepetidos[i]);
      }
    }
  }

  var pedidosPadreRef = db.ref('pedidoPadre/');
  pedidosPadreRef.once('value', function (snapshot) {
    var existe = snapshot.val() != null;
    if (existe) {
      var listapedidos = snapshot.val(),
          keys = Object.keys(listapedidos),
          last = keys[keys.length - 1],
          ultimoPedido = listapedidos[last],
          lastclave = ultimoPedido.clave,
          fechaCreacionPadre = moment().format('DD/MM/YYYY'),
          datosPedidoPadre = {
        // agente: "",
        fechaCreacionPadre: fechaCreacionPadre,
        fechaRuta: "",
        verificado: false,
        ruta: "",
        productos: productosNoRepetidos,
        clave: lastclave + 1,
        estado: "En proceso",
        pedidosHijos: pedidosHijos
      };

      pedidosPadreRef.push(datosPedidoPadre);

      for (var clave in claves) {
        var rutaPedidosHijos = db.ref("pedidoPadre/" + idPedidoPadre + "/pedidosHijos");
        rutaPedidosHijos.child(claves[clave]).remove();
      }
      limpiarTablaSeparado();

      rutaPedidoPadre.once('value', function (snapshot) {
        var pedidosHijos = snapshot.val().pedidosHijos;

        if (pedidosHijos == null) {
          var rutaPedidosPadre = db.ref('pedidoPadre');
          rutaPedidosPadre.child(idPedidoPadre).remove();
          $('#modalSeparar').modal('hide');
        }
      });
    }
  });
}

function limpiarTablaSeparado() {
  var row = "<tr id=\"vacio\" style=\"padding:0px 0px 0px;\" class=\"no-pading\">\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                </tr>";

  $('#tbodyTablaPedidoSeparado').html(row);
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: "Se ha separado el pedido" });
}

function mostrarPedidosFinalizados() {
  var tabla = $("#tablaPedidosFinalizados").DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

  var pedidosPadreRef = db.ref('pedidoPadre');
  pedidosPadreRef.on('value', function (snapshot) {
    var loader = $('#loaderPedidosFinalizados');
    var pedidosPadre = snapshot.val();
    if (pedidosPadre == null || pedidosPadre == undefined) {
      loader.remove();
      $('#pPedidosFinalizados').html('No se encontraron pedidos finalizados');
    }
    var filas = "";
    tabla.clear();
    for (var pedidoPadre in pedidosPadre) {
      if (pedidosPadre[pedidoPadre].estado == "Finalizado") {
        var diaCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(0, 2);
        var mesCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(3, 2);
        var añoCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(6, 4);
        var fechaCaptura = mesCaptura + "/" + diaCaptura + "/" + añoCaptura;
        moment.locale('es');

        var fechaCapturaMostrar = moment(fechaCaptura).format('LL');

        var fechaRutaMostrar = void 0;
        var rutaMostrar = void 0;
        if (pedidosPadre[pedidoPadre].fechaRuta.length > 0) {
          var diaRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(0, 2);
          var mesRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(3, 2);
          var añoRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(6, 4);
          var fechaRuta = mesRuta + "/" + diaRuta + "/" + añoRuta;

          fechaRutaMostrar = moment(fechaRuta).format('LL');
        } else {
          fechaRutaMostrar = "Fecha pendiente";
        }
        if (pedidosPadre[pedidoPadre].ruta.length == 0) {
          rutaMostrar = "Ruta pendiente";
        } else {
          rutaMostrar = pedidosPadre[pedidoPadre].ruta;
        }

        filas += "<tr>\n                    <td>" + pedidosPadre[pedidoPadre].clave + "</td>\n                    <td>" + fechaCapturaMostrar + "</td>\n                    <td>" + fechaRutaMostrar + "</td>\n                    <td>" + rutaMostrar + "</td>\n                    <td class=\"text-center\">" + (pedidosPadre[pedidoPadre].agente != undefined ? '<div class="radioBtn btn-group"><a class="btn btn-sm btn-agente">' + pedidosPadre[pedidoPadre].agente + '</a></div>' : "") + "</td>\n                    <td class=\"text-center\">\n                      <span style=\"background-color:#42f486; color:#000000;\" class=\"badge\">Finalizado</span>\n                    </td>\n                    <td class=\"text-center\"><a class=\"btn btn-default btn-sm\" href=\"pedidoPadre.html?id=" + pedidoPadre + "\"><span class=\"glyphicon glyphicon-eye-open\"></span> Ver m\xE1s</a></td>\n                  </tr>";
      }
    }
    $('#pPedidosFinalizados').remove();
    $('#loaderPedidosFinalizados').remove();
    $('#tablaPedidosFinalizados').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();

    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}

function abrirModalFinalizarPedidoPadre(idPedidoPadre) {
  $('#modalFinalizarPedidoPadre').modal('show');
  $('#btnFinalizarPedidoPadre').attr('onclick', "finalizarPedidoPadre('" + idPedidoPadre + "')");
}

function llenarSelectAgentes() {
  var rutaAgentes = db.ref("usuarios/administrativo/ventas/agentes");
  rutaAgentes.on('value', function (snapshot) {
    var agentes = snapshot.val();

    var options = "<option value='Seleccionar'>Seleccionar</option>";
    for (var agente in agentes) {
      options += "<option value=\"" + agentes[agente].nombre + "\">" + agentes[agente].nombre + "</option>";
    }

    $('#agente').html(options);
  });
}

function finalizarPedidoPadre(idPedidoPadre) {
  var rutaPedidoPadre = db.ref("pedidoPadre/" + idPedidoPadre);
  rutaPedidoPadre.update({
    estado: "Finalizado"
  });
}

function verificarPedidoPadre(idPedidoPadre) {
  var rutaPedidoPadre = db.ref("pedidoPadre/" + idPedidoPadre);
  rutaPedidoPadre.update({
    verificado: true
  });
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: "Pedido verificado" });
}

function abrirModalModificarRuta(idPedidoPadre) {
  var rutaPedidosPadre = db.ref("pedidoPadre/" + idPedidoPadre);
  rutaPedidosPadre.once('value', function (snapshot) {
    $('#fechaRuta').val(snapshot.val().fechaRuta);
    $('#ruta').val(snapshot.val().ruta);
    var agente = snapshot.val().agente;
    // if(agente != undefined) {
    //   let rutaAgentes = db.ref(`usuarios/administrativo/ventas/agentes/${agente}`);
    //   rutaAgentes.once('value', function(datos){
    //     $('#agenteAsignado').html(`${datos.val().nombre}`).removeClass('hidden');
    //   });
    // }

    $('#modalModificarRuta').modal('show');
    llenarSelectAgentes();
    if (agente != undefined) {
      $('#agente').val(agente);
    }
    $('#btnGuardarRuta').attr('onclick', "guardarDatos('" + idPedidoPadre + "')");
  });
}

// function asignarAgente() {
//   let agente = $('#agente').val();
//   let nombreAgente = $('#agente').text();
//   if(agente != undefined && agente != null) {
//     $('#agenteAsignado').html(`<a class="btn btn-agente">${nombreAgente}</a>`);
//     agenteAsignado = agente;
//   }
// }

function guardarDatos(idPedidoPadre) {
  var fechaRuta = $('#fechaRuta').val();
  var ruta = $('#ruta').val();
  var agente = $('#agente').val();

  var rutaPedidosPadre = db.ref("pedidoPadre/" + idPedidoPadre);
  rutaPedidosPadre.update({
    fechaRuta: fechaRuta,
    ruta: ruta,
    // agente: agenteAsignado
    agente: agente
  });

  // agenteAsignado = "";
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: "Datos guardados" });
  $('#modalModificarRuta').modal('hide');
}

dragula([document.getElementById('tbodyTablaPedidos'), document.getElementById('tbodyTablaPedidoPadre')]);
dragula([document.getElementById('tbodyTablaOrdenes'), document.getElementById('tbodyTablaPedidoPadre')]);

function generarPedidoPadre() {
  var pedidos = [],
      claves = [],
      promotoras = [];
  var productosRepetidos = [],
      productosNoRepetidos = [];

  $("#tablaPedidoPadre tbody tr").each(function (i) {
    var clave;
    $(this).children("td").each(function (j) {
      if (j == 0) {
        if ($(this).text().length > 0) {
          clave = $(this).text();
          claves.push(clave);

          var pedidoEntradaRef = db.ref("pedidoEntrada/" + clave + "/encabezado");
          pedidoEntradaRef.once('value', function (snapshot) {
            promotora = snapshot.val().promotora;
            promotoras.push(promotora);
          });
        }
      }
    });

    if ($(this).attr('id') != "vacio") {
      var pedidoRef = db.ref("pedidoEntrada/" + clave);
      pedidoRef.once('value', function (snapshot) {
        var pedido = snapshot.val();
        pedidos.push(pedido);

        var detalle = pedido.detalle;
        for (var producto in detalle) {
          var datosProducto = {
            claveConsorcio: detalle[producto].claveConsorcio,
            clave: detalle[producto].clave,
            precioUnitario: detalle[producto].precioUnitario,
            nombre: detalle[producto].nombre,
            degusPz: detalle[producto].degusPz,
            degusKg: detalle[producto].degusKg,
            pedidoPz: detalle[producto].pedidoPz,
            pedidoKg: detalle[producto].pedidoKg,
            totalKg: detalle[producto].totalKg,
            totalPz: detalle[producto].totalPz,
            unidad: detalle[producto].unidad,
            cambioFisicoPz: detalle[producto].cambioFisicoPz,
            cambioFisicoKg: detalle[producto].cambioFisicoKg
          };

          productosRepetidos.push(datosProducto);
        }
      });
    }
  });

  for (var i in productosRepetidos) {
    if (productosNoRepetidos.length == 0) {
      productosNoRepetidos.push(productosRepetidos[i]);
    } else {
      var bandera = false;
      for (var j in productosNoRepetidos) {

        if (productosRepetidos[i].clave == productosNoRepetidos[j].clave) {
          bandera = true;

          var productoNoRepetido = productosNoRepetidos[j];
          var productoRepetido = productosRepetidos[i];

          productoNoRepetido.totalKg = productoNoRepetido.totalKg + productoRepetido.totalKg;
          productoNoRepetido.totalPz = productoNoRepetido.totalPz + productoRepetido.totalPz;
        }
      }
      if (bandera == false) {
        productosNoRepetidos.push(productosRepetidos[i]);
      }
    }
  }

  var pedidosPadresRef = db.ref('pedidoPadre/');
  pedidosPadresRef.once('value', function (snapshot) {
    var existe = snapshot.val() != null;
    if (existe) {
      (function () {
        var listapedidos = snapshot.val(),
            keys = Object.keys(listapedidos),
            last = keys[keys.length - 1],
            ultimoPedido = listapedidos[last],
            lastclave = ultimoPedido.clave,
            fechaCreacionPadre = moment().format('DD/MM/YYYY'),
            pedidoPadreRef = db.ref('pedidoPadre/'),
            datosPedidoPadre = {
          fechaCreacionPadre: fechaCreacionPadre,
          fechaRuta: "",
          verificado: false,
          ruta: "",
          productos: productosNoRepetidos,
          clave: lastclave + 1,
          estado: "En proceso"
        };

        var key = pedidoPadreRef.push(datosPedidoPadre).getKey();
        var pedidoPadreRefKey = db.ref("pedidoPadre/" + key + "/pedidosHijos");
        //let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
        var pedidoEntradaRef = db.ref('pedidoEntrada');

        var datosPedidosHijos = {};

        var _loop = function _loop(pedido) {
          datosPedidosHijos[claves[pedido]] = pedidos[pedido];

          //Las siguientes dos líneas guardan en historial los pedidos que se estan agrupando tal
          //como se guardan en pedidosEntrada ya que al grupar se borran esos pedidos de pedidosEntrada.
          var rutaHistorialPedidosEntrada = db.ref("historialPedidosEntrada/" + claves[pedido] + "/");
          rutaHistorialPedidosEntrada.set(pedidos[pedido]);

          var promotoraRef = db.ref("usuarios/tiendas/supervisoras/" + pedidos[pedido].encabezado.promotora);
          promotoraRef.once('value', function (snapshot) {
            var region = snapshot.val().region;

            /*Se entra a pedidosEntrada para obtener el id de la tienda de ese pedido y mandar el pedido a historial de regiones
             *Y después removerlo de pedidosEntrada */
            var pedidoRef = db.ref("pedidoEntrada/" + claves[pedido]);
            pedidoRef.once('value', function (snappy) {

              // let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
              // let regionRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`);
              // regionRef.push(pedidos[pedido]);

              pedidoEntradaRef.child(claves[pedido]).update({
                agrupado: true
              });
            });
          });
        };

        for (var pedido in pedidos) {
          _loop(pedido);
        }

        pedidoPadreRefKey.set(datosPedidosHijos);
        //historialPedidosEntradaRef.push(datosPedidosHijos);

        var row = "<tr id=\"vacio\" style=\"padding:0px 0px 0px;\" class=\"no-pading\">\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                </tr>";
        $('#tbodyTablaPedidoPadre').html(row);
        $.toaster({ priority: 'success', title: 'Mensaje de información', message: "Se gener\xF3 el pedido padre correctamente" });

        // for(let promotora in promotoras) {
        //   let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
        //   moment.locale('es');
        //   let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
        //   let fecha = formato.toString();
        //   let notificacion = {
        //     fecha: fecha,
        //     leida: false,
        //     mensaje: `El pedido: ${claves[promotora]} se ha agrupado.`
        //   }

        //   notificacionesListaRef.push(notificacion);

        //   let notificacionesRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}`);
        //   notificacionesRef.once('value', function(snapshot) {
        //     let notusuario = snapshot.val();
        //     let cont = notusuario.cont + 1;

        //     notificacionesRef.update({cont: cont});
        //   });
        // }
        enviarNotificacion(promotoras, claves);
      })();
    } else {
      (function () {
        var fechaCreacionPadre = moment().format('DD/MM/YYYY');
        var pedidoPadreRef = db.ref('pedidoPadre/');
        var datosPedidoPadre = {
          fechaCreacionPadre: fechaCreacionPadre,
          fechaRuta: "",
          ruta: "",
          verificado: false,
          productos: productosNoRepetidos,
          clave: 1,
          estado: "En proceso"
        };
        var key = pedidoPadreRef.push(datosPedidoPadre).getKey();

        var pedidoPadreRefKey = db.ref("pedidoPadre/" + key + "/pedidosHijos");
        // let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
        var pedidoEntradaRef = db.ref('pedidoEntrada');

        var datosPedidosHijos = {};

        var _loop2 = function _loop2(pedido) {
          datosPedidosHijos[claves[pedido]] = pedidos[pedido];

          //Las siguientes dos líneas guardan en historial los pedidos que se estan agrupando tal
          //como se guardan en pedidosEntrada ya que al grupar se borran esos pedidos de pedidosEntrada.
          var rutaHistorialPedidosEntrada = db.ref("historialPedidosEntrada/" + claves[pedido] + "/");
          rutaHistorialPedidosEntrada.set(pedidos[pedido]);

          var promotoraRef = db.ref("usuarios/tiendas/supervisoras/" + pedidos[pedido].encabezado.promotora);
          promotoraRef.once('value', function (snapshot) {
            var region = snapshot.val().region;

            /*Se entra a pedidosEntrada para obtener el id de la tienda de ese pedido y mandar el pedido a historial de regiones
             *Y después removerlo de pedidosEntrada */
            var pedidoRef = db.ref("pedidoEntrada/" + claves[pedido]);
            pedidoRef.once('value', function (snappy) {
              // let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
              // let regionRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`);
              // regionRef.push(pedidos[pedido]);

              pedidoEntradaRef.child(claves[pedido]).update({
                agrupado: true
              });
            });
          });
        };

        for (var pedido in pedidos) {
          _loop2(pedido);
        }

        pedidoPadreRefKey.set(datosPedidosHijos);
        // historialPedidosEntradaRef.push(datosPedidosHijos);

        var row = "<tr id=\"vacio\" style=\"padding:0px 0px 0px;\" class=\"no-pading\">\n                  <td scope=\"row\" style=\"border:none;\"></td>\n                  <td></td>\n                  <td></td>\n                  <td></td>\n                  <td class=\"no-padding\"></td>\n                  <td class=\"no-padding\"> </td>\n                </tr>";
        $('#tbodyTablaPedidoPadre').html(row);

        $.toaster({ priority: 'success', title: 'Mensaje de información', message: "Se gener\xF3 el pedido padre correctamente" });

        // for(let promotora in promotoras) {
        //   let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
        //   moment.locale('es');
        //   let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
        //   let fecha = formato.toString();
        //   let notificacion = {
        //     fecha: fecha,
        //     leida: false,
        //     mensaje: "El pedido: " + claves[promotora] + " se ha agrupado."
        //   }

        //   notificacionesListaRef.push(notificacion);

        //   let notificacionesRef = db.ref('notificaciones/tiendas/'+promotoras[promotora]);
        //   notificacionesRef.once('value', function(snapshot) {
        //     let notusuario = snapshot.val();
        //     let cont = notusuario.cont + 1;

        //     notificacionesRef.update({cont: cont});
        //   });
        // }
        enviarNotificacion(promotoras, claves);
      })();
    }
  });
}

function enviarNotificacion(promotoras, claves) {
  var _loop3 = function _loop3(_promotora) {
    var notificacionesListaRef = db.ref("notificaciones/tiendas/" + promotoras[_promotora] + "/lista");
    moment.locale('es');
    var formato = moment().format("MMMM DD YYYY, HH:mm:ss");
    var fecha = formato.toString();
    var notificacion = {
      fecha: fecha,
      leida: false,
      mensaje: "El pedido: " + claves[_promotora] + " se ha agrupado."
    };

    notificacionesListaRef.push(notificacion);

    var notificacionesRef = db.ref('notificaciones/tiendas/' + promotoras[_promotora]);
    notificacionesRef.once('value', function (snapshot) {
      var notusuario = snapshot.val();
      var cont = notusuario.cont + 1;

      notificacionesRef.update({ cont: cont });
    });
  };

  for (var _promotora in promotoras) {
    _loop3(_promotora);
  }
}

function cancelarPedidoPadre() {
  /*let filas = $('#tablaPedidoPadre tbody tr');
   filas.each(function (i) {
    $('#tablaPedidos tbody').append(filas[i]);
    $('#tablaPedidoPadre tbody').remove(filas[i]);
    $('#tablaPedidoPadre tbody')
      .append(`<tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`);
  });*/
  $('#tablaPedidoPadre tbody').empty().append("<tr>\n              <td></td>\n              <td></td>\n              <td></td>\n              <td></td>\n              <td></td>\n              <td></td>\n              <td></td>\n              <td></td>\n            </tr>");
  mostrarPedidos();
}

function pedidosRecibidos() {
  $('#pedidosEnProceso').hide();
  $('#pedidosFinalizados').hide();
  $('#historialPedidos').hide();
  $('#pedidosRecibidos').show();

  mostrarPedidos();
}

// $('#tabPedidosRecibidos').on('shown.bs.tab', function (e) {
//   mostrarPedidos();
//   $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();

//   console.log("pedidos recibidos")
// });

// $('#tabPedidosEnProcesoTerminados').on('shown.bs.tab', function (e) {
//   mostrarPedidosEnProceso();
//   $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
// });

// $('#tabHistorialPedidos').on('shown.bs.tab', function (e) {
//   mostrarHistorialPedidos();
//   console.log("tabHistorial")
//   $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
// })

function pedidosEnProceso() {
  $('#pedidosRecibidos').hide();
  $('#historialPedidos').hide();
  $('#pedidosFinalizados').hide();
  $('#pedidosEnProceso').show();

  mostrarPedidosEnProceso();
}

function historialPedidos() {
  $('#pedidosRecibidos').hide();
  $('#pedidosEnProceso').hide();
  $('#pedidosFinalizados').hide();
  $('#historialPedidos').show();

  mostrarHistorialPedidos();
}

function pedidosFinalizados() {
  $('#pedidosRecibidos').hide();
  $('#pedidosEnProceso').hide();
  $('#historialPedidos').hide();
  $('#pedidosFinalizados').show();

  mostrarPedidosFinalizados();
}

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref("notificaciones/almacen/" + usuario + "lista");
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = "";

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += "<li>\n                <a>\n                  <div>\n                    <i class=\"fa fa-comment fa-fw\"></i>" + arrayNotificaciones[i].mensaje + "\n                    <span class=\"pull-right text-muted small\">" + fecha + "</span>\n                  </div>\n                </a>\n              </li>";
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref("notificaciones/almacen/" + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref("notificaciones/almacen/" + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});