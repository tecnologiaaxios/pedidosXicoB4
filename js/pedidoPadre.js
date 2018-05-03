const db = firebase.database();
const auth = firebase.auth();
var Tpz, Tkg;

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  //$('#Imprimir').attr('disabled', true);

  $('.loader').hide();
  $('#panel').show();
  $('[data-toggle="tooltip"]').tooltip();

  mostrarDatos();
  mostrarTodas();
});

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
      mostrarDatos();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

function mostrarDatos() {
  let idPedidoPadre = getQueryVariable('id');
  //let pedidosPadre = JSON.parse(localStorage.getItem('pedidosPadre'));
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos padre de localforage');
    let pedidosPadre = value;
    let datos = pedidosPadre[idPedidoPadre],
        fecha = datos.fechaCreacionPadre;

    $('#numPedido').html(`Pedido: ${datos.clave}`);

    let dia = fecha.substr(0, 2),
      mes = fecha.substr(3, 2),
      año = fecha.substr(6, 4),
      fechaCreacion = `${mes}/${dia}/${año}`;
    moment.locale('es');
    let fechaCreacionMostrar = moment(fechaCreacion).format('LL');
    $('#fechaPedido').html(`Ruta: ${datos.ruta}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Recibido el ${fechaCreacionMostrar}`);
  });
}

function llenarSelectTiendas() {
  let idPedidoPadre = getQueryVariable('id');
  //let pedidosPadre = JSON.parse(localStorage.getItem('pedidosPadre'));
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidosPadre = value;
    let pedidoPadre = pedidosPadre[idPedidoPadre],
        pedidosHijos = pedidoPadre.pedidosHijos,
        options = `<option value="Todas">Todas las tiendas</option>`,
        optionsChecado = "";

    for (pedidoHijo in pedidosHijos) {
      options += `<option value="${pedidoHijo}">${pedidosHijos[pedidoHijo].encabezado.tienda}</option>`;
      optionsChecado += `<option value="${pedidoHijo}">${pedidosHijos[pedidoHijo].encabezado.tienda}</option>`;
    }

    $('#tiendas').html(options);
    $('#tiendasChecado').html(optionsChecado);
  });
}

llenarSelectTiendas();

$('#tiendasChecado').change(function () {
  let tiendaChecada = $(this).val();
  mostrarUnaChecada(tiendaChecada);
});

$('#tipoPedido').change(function () {
  let tienda = $('#tiendas').val();
  mostrarUna(tienda);
});

$('#tipoPedidoChecado').change(function () {
  let tiendaChecado = $('#tiendasChecado').val();
  mostrarUnaChecada(tiendaChecado);
});

$('#aPedidosChecados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

function mostrarPedidosChecados() {
  let idPedidoPadre = getQueryVariable('id');
  //et pedidosPadre = JSON.parse(localStorage.getItem('pedidosPadre'));
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidos = value;
    let pedidoPadre = pedidosPadre[idPedidoPadre],
        pedidosHijos = pedidoPadre.pedidosHijos;

    let datatable = $(`#pedidosChecados`).DataTable({
      destroy: true,
      lengthChange: false,
      scrollY: "200px",
      scrollCollapse: true,
      ordering: false,
      language: {
        sProcessing: 'Procesando...',
        sLengthMenu: 'Mostrar _MENU_ registros',
        sZeroRecords: 'No se encontraron resultados',
        sEmptyTable: 'Ningún dato disponible en esta tabla',
        sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
        sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
        sInfoPostFix: '',
        sSearch: 'Buscar',
        sUrl: '',
        sInfoThousands: ',',
        sLoadingRecords: 'Cargando...',
        oPaginate: {
          sFirst: 'Primero',
          sLast: 'Último',
          sNext: 'Siguiente',
          sPrevious: 'Anterior'
        },
        oAria: {
          sSortAscending: ': Activar para ordenar la columna de manera ascendente',
          sSortDescending: ': Activar para ordenar la columna de manera descendente'
        }
      }
    });

    datatable.clear();
    let filas = '';

    for (let pedidoHijo in pedidosHijos) {
      if (pedidosHijos[pedidoHijo].encabezado.checado == true) {
        filas += `<tr>
                    <td>${pedidoHijo}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.tienda}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.cantidadProductos}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.totalKilos}</td>
                    <td>${pedidosHijos[pedidoHijo].encabezado.totalPiezas}</td>
                  </tr>`;
      }
    }

    //$('#pedidosChecados tbody').html(filas);
    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarTodas() {
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');

    let idPedidoPadre = getQueryVariable('id'),
        pedidosPadre =  value;//JSON.parse(localStorage.getItem('pedidosPadre')),
        pedidoPadre = pedidosPadre[idPedidoPadre],
        productos = pedidoPadre.productos;

    let datatable = $(`#tablaPedidos`).DataTable();
    datatable.destroy();

    $('#tablaPedidos').empty();
    datatable = $('#tablaPedidos').DataTable({
      pageLength: 10,
      ordering: false,
      paging: false,
      searching: false,
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'excel',
          className: 'btn btn-info',
          text: '<i class="far fa-file-excel"></i> Excel'
      }],
      scrollY: "500px",
      scrollCollapse: true,
      columns: [
        { title: "Clave" },
        { title: "Descripción" },
        { title: "Total Pz" },
        { title: "Total Kg" },
        { title: "Precio unit." },
        { title: "Importe" }
      ],
      language: {
        sProcessing: 'Procesando...',
        sLengthMenu: 'Mostrar _MENU_ registros',
        sZeroRecords: 'No se encontraron resultados',
        sEmptyTable: 'Ningún dato disponible en esta tabla',
        sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
        sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
        sInfoPostFix: '',
        sSearch: 'Buscar',
        sUrl: '',
        sInfoThousands: ',',
        sLoadingRecords: 'Cargando...',
        oPaginate: {
          sFirst: 'Primero',
          sLast: 'Último',
          sNext: 'Siguiente',
          sPrevious: 'Anterior'
        },
        oAria: {
          sSortAscending: ': Activar para ordenar la columna de manera ascendente',
          sSortDescending: ': Activar para ordenar la columna de manera descendente'
        }
      }
    });

    $('#tableinfo').hide();
    datatable.clear();

    let filas = "",
      TotalPz, TotalKg,
      TotalPzs = 0, TotalKgs = 0, TotalPrecUni = 0, TotalImporte = 0;

    for (producto in productos) {
      let importe = 0;
      if (productos[producto].unidad == "PZA") {
        importe = productos[producto].totalPz * productos[producto].precioUnitario;
      }
      if (productos[producto].unidad == "KG") {
        importe = productos[producto].totalKg * productos[producto].precioUnitario;
      }
      filas += `<tr>
                  <td>${productos[producto].clave}</td>
                  <td>${productos[producto].nombre}</td>
                  <td class="text-right TotalPz">${productos[producto].totalPz}</td>
                  <td class="text-right TotalKg">${productos[producto].totalKg.toFixed(2)}</td>
                  <td class="text-right precioUnitario">$ ${productos[producto].precioUnitario.toFixed(2)}</td>
                  <td class="text-right Importe">$ ${importe.toFixed(2)}</td>
                </tr>`;
      TotalPzs += productos[producto].totalPz;
      TotalKgs += productos[producto].totalKg;
      TotalPrecUni += productos[producto].precioUnitario;
      TotalImporte += importe;
    }
    filas += `<tr>
                <td>&nbsp</td>
                <td class="text-right"><strong>Totales</strong></td>
                <td class="text-right"><strong>${TotalPzs}</strong></td>
                <td class="text-right"><strong>${TotalKgs.toFixed(2)}</strong></td>
                <td class="text-right"><strong>$ ${TotalPrecUni.toFixed(2)}</strong></td>
                <td class="text-right"><strong>$ ${TotalImporte.toFixed(2)}</strong></td>
              </tr>`;
    // $('#theadTablaPedidos').html('<tr><th>Clave</th><th>Descripción</th><th>Total Pz</th><th>Total Kg</th><th>Precio unit.</th><th>Importe</th></tr>');
    // $('#tbodyTablaPedidos').html(filas);

    //$('#tablaPedidos tbody').html(filas);

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarUna(idPedidoHijo) {
  let filtro = $('#tiendas').val();

  if(filtro != "Todas") {
    let idPedidoPadre = getQueryVariable('id');
    //let pedidosPadre = JSON.parse(localStorage.getItem('pedidosPadre'));
    localforage.getItem('pedidosPadre', (err, value) => {
      console.log('Obteniendo pedidos padre de localforage');
      let pedidosPadre = value;

      let pedidoPadre = pedidosPadre[idPedidoPadre];
      let pedidoHijo = pedidoPadre.pedidosHijos[idPedidoHijo];

      let datatable = $(`#tablaPedidos`).DataTable();
      datatable.destroy();
      $('#tablaPedidos').empty();
      datatable.clear();

      let tipoPedido = $('#tipoPedido').val();
      let pieza;
      switch (tipoPedido) {
        case 'cambioFisico':
          pieza = "Cambio físico";
          break;
        case 'degusPz':
          pieza = "Degustación Pz";
          break;
        case 'pedidoPz':
          pieza = "Pedido Pz";
          break;
      }

      datatable = $(`#tablaPedidos`).DataTable({
        ordering: false,
        paging: false,
        searching: false,
        dom: 'Bfrtip',
        buttons: [
          {
            extend: 'excel',
            className: 'btn btn-info',
            text: '<i class="far fa-file-excel"></i> Excel'
        }],
        scrollY: "500px",
        scrollCollapse: true,
        columns: [
          { title: "Clave cliente" },
          { title: "Clave Xico" },
          { title: "Descripción" },
          { title: pieza },
          { title: "Kg" },
          { title: "Precio unit." },
          { title: "Importe" }
        ],
        language: {
          sProcessing: 'Procesando...',
          sLengthMenu: 'Mostrar _MENU_ registros',
          sZeroRecords: 'No se encontraron resultados',
          sEmptyTable: 'Ningún dato disponible en esta tabla',
          sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
          sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
          sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
          sInfoPostFix: '',
          sSearch: 'Buscar',
          sUrl: '',
          sInfoThousands: ',',
          sLoadingRecords: 'Cargando...',
          oPaginate: {
            sFirst: 'Primero',
            sLast: 'Último',
            sNext: 'Siguiente',
            sPrevious: 'Anterior'
          },
          oAria: {
            sSortAscending: ': Activar para ordenar la columna de manera ascendente',
            sSortDescending: ': Activar para ordenar la columna de manera descendente'
          }
        }
      });

      let detalles = pedidoHijo.detalle,
        encabezado = pedidoHijo.encabezado,
        tienda = encabezado.tienda,
        filas = "",
        totalPiezas = 0, totalKilos = 0, totalImporte = 0,
        cantidadPiezas, cantidadKg;

      for (let producto in detalles) {
        switch (tipoPedido) {
          case 'cambioFisico':
            cantidadPiezas = detalles[producto].cambioFisicoPz;
            cantidadKg = detalles[producto].cambioFisicoKg;
            break;
          case 'degusPz':
            cantidadPiezas = detalles[producto].degusPz;
            cantidadKg = detalles[producto].degusKg;
            break;
          case 'pedidoPz':
            cantidadPiezas = detalles[producto].pedidoPz;
            cantidadKg = detalles[producto].pedidoKg;
            break;
        }
        let importe = 0;
        if (detalles[producto].unidad == "PZA") {
          importe = cantidadPiezas * detalles[producto].precioUnitario;
        }
        if (detalles[producto].unidad == "KG") {
          importe = cantidadKg * detalles[producto].precioUnitario;
        }
        totalPiezas += cantidadPiezas;
        totalKilos += cantidadKg;
        totalImporte += Number(importe.toFixed(2));
        filas += `<tr>
                    <td>${detalles[producto].claveConsorcio}</td>
                    <td>${detalles[producto].clave}</td>
                    <td>${detalles[producto].nombre}</td>
                    <td>${cantidadPiezas}</td>
                    <td>${cantidadKg.toFixed(2)}</td>
                    <td>$ ${detalles[producto].precioUnitario.toFixed(2)}</td>
                    <td>$ ${importe.toFixed(2)}</td>
                  </tr>`;
      }

      let fechaImpresion = new moment().format("DD/MM/YYYY");
      filas += `<tr>
                  <td>&nbsp</td>
                  <td>&nbsp</td>
                  <td><strong>Total general</strong></td>
                  <td><strong>${totalPiezas}</strong></td>
                  <td><strong>${totalKilos.toFixed(2)}</strong></td>
                  <td>&nbsp</td>
                  <td><strong>$ ${totalImporte.toFixed(2)}</strong></td>
                </tr>`;
      // $('#theadTablaPedidos').html(`<tr><th>Clave Cliente</th><th>Clave Xico</th><th>Descripción</th><th>${pieza}</th><th>Kg</th><th>Precio unit.</th><th>Importe</th></tr>`);
      // $('#tbodyTablaPedidos').html(row);
      datatable.rows.add($(filas)).columns.adjust().draw();

      $('#theadTableInfo').html(`<tr><th>O. C.:</th><th>Fecha: ${fechaImpresion}</th></tr>`);
      $('#tbodyTableInfo').html(
        `<tr>
            <td>Núm. de orden:</td>
            <td><strong>${encabezado.numOrden}</strong></td>
          </tr>
          <tr>
            <td>Consorcio:</td>
            <td>${encabezado.consorcio}</td>
          </tr>
          <tr>
            <td>SUC:</td>
            <td>${tienda}</td>
          </tr>`);
      $('#tableinfo').show();

      $('.TotalPz').text(Tpz);
      $('.TotalKg').text(Tkg);
    });
  }
}

function mostrarUnaChecada(idPedidoHijo) {
  let idPedidoPadre = getQueryVariable('id');
  //let pedidosPadre = JSON.parse(localStorage.getItem('pedidosPadre'));
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidosPadre = value;
    let pedidoPadre = pedidosPadre[idPedidoPadre],
        pedidoHijo = pedidoPadre.pedidosHijos[idPedidoHijo],
        detalles = pedidoHijo.detalle,
        encabezado = pedidoHijo.encabezado,
        tienda = encabezado.tienda,
        filas = "",
        totalPiezas = 0, totalKilos = 0, totalPzEnt = 0, totalKgEnt = 0;

    let tipoPedido = $('#tipoPedidoChecado').val(),
        cantidadPiezas,
        cantidadKg,
        cantidadPzEnt,
        cantidadKgEnt;

    for (let producto in detalles) {
      let prod = detalles[producto];
      switch (tipoPedido) {
        case 'cambioFisico':
          cantidadPiezas = prod.cambioFisicoPz;
          cantidadKg = prod.cambioFisicoKg;
          cantidadPzEnt = (prod.pzCambioFisicoEnt != undefined) ? prod.pzCambioFisicoEnt : 0;
          cantidadKgEnt = (prod.kgCambioFisicoEnt != undefined) ? prod.kgCambioFisicoEnt : 0;
          break;
        case 'degusPz':
          cantidadPiezas = prod.degusPz;
          cantidadKg = prod.degusKg;
          cantidadPzEnt = (prod.pzDegusEnt != undefined) ? prod.pzDegusEnt : 0;
          cantidadKgEnt = (prod.kgDegusEnt != undefined) ? prod.kgDegusEnt : 0;
          break;
        case 'pedidoPz':
          cantidadPiezas = prod.pedidoPz;
          cantidadKg = prod.pedidoKg;
          cantidadPzEnt = (prod.pzPedidoEnt != undefined) ? prod.pzPedidoEnt : 0;
          cantidadKgEnt = (prod.kgPedidoEnt != undefined) ? prod.kgPedidoEnt : 0;
          break;
      }
      totalPiezas += cantidadPiezas;
      totalKilos += cantidadKg;
      totalPzEnt += cantidadPzEnt;
      totalKgEnt += cantidadKgEnt;

      filas += `<tr>
                  <td>${prod.clave}</td>
                  <td>${prod.nombre}</td>
                  <td>${cantidadPiezas}</td>
                  <td>${cantidadKg.toFixed(2)}</td>
                  <td>${cantidadPzEnt}</td>
                  <td>${cantidadKgEnt.toFixed(2)}</td>
                </tr>`;
    }

    filas += `<tr>
                <td></td>
                <td><strong>Total general</strong></td>
                <td><strong>${totalPiezas}</strong></td>
                <td><strong>${totalKilos.toFixed(2)}</strong></td>
                <td><strong>${totalPzEnt}</strong></td>
                <td><strong>${totalKgEnt}</strong></td> 
              </tr>`;
    $('#tablaPedidosChecados tbody').html(filas);
  });
}

$('#tiendas').change(function () {
  let tienda = $(this).val();

  if (tienda == "Todas") {
    mostrarTodas();
    //$('#Imprimir').attr('disabled', true);
  }
  else {
    mostrarUna(tienda);
    $('#Imprimir').attr('disabled', false);
  }
});

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    let lista = snapshot.val();
    let lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    let arrayNotificaciones = [];
    for (let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for (let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += `<li>
                <a>
                  <div>
                  <i class="fa fa-comment fa-fw"></i>${arrayNotificaciones[i].mensaje}
                  <span class="pull-right text-muted small">${fecha}</span>
                  </div>
                </a>
              </li>`;
    }

    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.on('value', function (snapshot) {
    let cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

//de esta manera funciona en el navegador
// function generarPDF() {
//   let pdf = new jsPDF('p', 'pt');

//   let res = pdf.autoTableHtmlToJson(document.getElementById('tablaPedidos'));
//   let res2 = pdf.autoTableHtmlToJson(document.getElementById('tableinfo'));
//   let res3 = pdf.autoTableHtmlToJson(document.getElementById('table-bottom'));

//   pdf.autoTable(res2.columns, res2.data, {
//     startY: false,
//     tableWidth: 'auto',
//     columnWidth: 'auto',
//     styles: {
//       overflow: 'linebreak'
//     },
//     margin: {top: 75}
//   });

//   pdf.autoTable(res.columns, res.data, {
//     startY: pdf.autoTableEndPosY() + 10,
//     tableWidth: 'auto',
//     columnWidth: 'auto',
//     styles: {
//       overflow: 'linebreak'
//     },
//     theme: 'grid',
//     margin: {top: 150}
//   });

//   pdf.autoTable(res3.columns, res3.data, {
//     startY: pdf.autoTableEndPosY() + 20,
//     tableWidth: 'auto',
//     columnWidth: 'auto',
//     styles: {
//       overflow: 'linebreak',
//       fillColor: [255, 255, 255],
//       textColor: [0, 0, 0],
//     },
//     margin: {top: 150},
//     theme: 'grid', // 'striped', 'grid',
//     tableLineColor: [255, 255, 255]
//   });

//   //pdf.save('Pedido.pdf');
//   //pdf.output('dataurlnewwindow');
//   var string = pdf.output('datauristring');
//   var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
//   var x = window.open();
//   x.document.open();
//   x.document.write(iframe);
//   x.document.close();
// }

//De esta manera funciona en electron
function generarPDF() {
  var jsPDF = require('jspdf');
  require('jspdf-autotable');
  let pdf = new jsPDF('p', 'pt');

  let res = pdf.autoTableHtmlToJson(document.getElementById('tablaPedidos'));
  let res2 = pdf.autoTableHtmlToJson(document.getElementById('tableinfo'));
  let res3 = pdf.autoTableHtmlToJson(document.getElementById('table-bottom'));

  pdf.autoTable(res2.columns, res2.data, {
    startY: false,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    margin: { top: 75 }
  });

  pdf.autoTable(res.columns, res.data, {
    startY: pdf.autoTableEndPosY() + 10,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak'
    },
    theme: 'grid',
    margin: { top: 150 }
  });

  pdf.autoTable(res3.columns, res3.data, {
    startY: pdf.autoTableEndPosY() + 20,
    tableWidth: 'auto',
    columnWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    margin: { top: 150 },
    theme: 'grid', // 'striped', 'grid',
    tableLineColor: [255, 255, 255]
  });

  pdf.save('Pedido.pdf');
  pdf.output('dataurlnewwindow');
}
