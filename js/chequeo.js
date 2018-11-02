const db = firebase.database();
const auth = firebase.auth();

const LANGUAGE = {
  searchPlaceholder: "Buscar",
  sProcessing: 'Procesando...',
  sLengthMenu: 'Mostrar _MENU_ registros',
  sZeroRecords: 'No se encontraron resultados',
  sEmptyTable: 'Ningún dato disponible en esta tabla',
  sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
  sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
  sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
  sInfoPostFix: '',   
  sSearch: '<i style="color: #4388E5;" class="fas fa-search"></i>',
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
};

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    // startDate: "today",
    language: "es"
  });

  mostrarDatosChequeo();
});

function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

function haySesion() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarNotificaciones() {
    let usuario = auth.currentUser.uid;
    let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
    notificacionesRef.on('value', function (snapshot) {
      let lista = snapshot.val();
      let lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';
  
      let arrayNotificaciones = [];
      for (let notificacion in lista) {
        arrayNotificaciones.unshift(lista[notificacion]);
      }
  
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

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}

function mostrarDatosChequeo() {
  let datatable = $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    language: LANGUAGE,
    scrollY: "500px",
    scrollCollapse: true,
  });

  let idChequeo = getQueryVariable('id');

  db.ref(`chequeosPrecios/${idChequeo}`).on('value', chequeo => {

    console.log(chequeo.val())
    let { consorcio, fechaCaptura, productos, zona } = chequeo.val();

    $('#consorcio').html(consorcio);
    $('#fechaCaptura').html(fechaCaptura);
    $('#zona').html(zona);
    $('#fecha').html(fechaCaptura);

    let filas = '';

    datatable.clear().draw();
    // let totalKilos = 0, totalPesos = 0;
    for(let producto in productos) {
      const {clave, nombre, precioRegular, precioSugerido} = productos[producto]; 


      filas += `<tr>
                  <td>${clave}</td>
                  <td>${nombre}</td>
                  <td>$ ${precioRegular}</td>
                  <td>$ ${precioSugerido}</td>
                  <td><button class="btn btn-xs btn-warning" onclick="editarProducto('${producto}')"><i class="fas fa-pencil-alt"></i></button></td>
                </tr>`;
    }

    /* $('#totalKilos').html(`${totalKilos} kg`);
    $('#totalPesos').html(`$ ${totalPesos.toFixed(2)}`) */;

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function editarProducto(claveProducto) {
  let idChequeo = getQueryVariable('id');
  let consorcio = $('#consorcio').text();
  $('#modalEditar').modal('show');
  $('#btnActualizar').attr('onclick', `actualizarProducto('${claveProducto}')`);
  db.ref(`chequeosPrecios/${idChequeo}/productos/${claveProducto}`).once('value', snapshot => {
    $('#nombreProducto').val(snapshot.val().nombre);
    $('#claveProducto').val(snapshot.val().clave);
    $('#precioRegular').val(snapshot.val().precioRegular);
    $('#precioSugerido').val(snapshot.val().precioSugerido);
  });
  /* db.ref(`consorcios/${consorcio}/productos/${claveProducto}`).once('value', snapshot => {
    $('#precio').val(snapshot.val().precioUnitario);
  }); */
}

function actualizarProducto(claveProducto) {
  let idChequeo = getQueryVariable('id');
  let precioRegular = parseInt($('#precioRegular').val());
  let precioSugerido = parseInt($('#precioSugerido').val());

  db.ref(`chequeosPrecios/${idChequeo}/productos/${claveProducto}`).update({
    precioRegular,
    precioSugerido
  });
  $('#modalEditar').modal('hide');

  swal({
    type: 'success',
    title: 'Mensaje',
    text: 'El chequeo se actualizó con éxito',
  });
}

function exportarCSV() {
  let idVenta = getQueryVariable('id');
  let result, ctr, keys, columnDelimiter, lineDelimiter;
  db.ref(`ventasDiarias/${idVenta}`).on('value', venta => {
    const {consorcio, fecha, idPromotora, nombrePromotora, productos, tienda, totalKilos, totalPesos, zona} = venta.val();
    let arrayProductos = [];

    result = `\nConsorcio: ${consorcio}\n
              Fecha: ${fecha}\n
              Id promotora ${idPromotora}\n
              Promotora: ${nombrePromotora}\n
              Tienda: ${tienda}\n
              Total en kilos: ${totalKilos}\n
              Total en pesos: ${totalPesos}\n
              \n`;

    Object.keys(productos).forEach(key => {
      const {
        nombre,
        kilos,
        pesos
      } = productos[key];

      arrayProductos.push({
        Clave: key,
        Nombre: nombre,
        ['Total Kilos']: kilos,
        ['Total Pesos']: pesos,
      });
    });
    let data = arrayProductos || null;

    let args = {data:arrayProductos};

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);
/*     result = ''; */
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(item => {
      ctr = 0;
      keys.forEach(key => {
        if(ctr > 0) result += columnDelimiter;

        result += item[key];
        ctr++;
      })
      result += lineDelimiter;
    });

    let csv = result;
    if(csv == null) return;
    let filename = 'venta diaria.csv';

    if(!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    let datos = encodeURI(csv);
    let link = document.createElement('a');
    link.setAttribute('href', datos);
    link.setAttribute('download', filename);
    link.click();
  });
}