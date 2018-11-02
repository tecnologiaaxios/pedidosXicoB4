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

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });

  llenarConsorcios();
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

$('#consorcio').change(() => {
    mostrarProductos();
});

function llenarConsorcios() {
  db.ref('consorcios').once('value', snapshot => {
    let options = '<option disabled selected>Seleccionar</option>';
    let consorcios = snapshot.val();

    for(let consorcio in consorcios) {
      options += `<option value="${consorcio}">${consorcio}</option>`;
    }

    $('#consorcio').html(options);
  });
}

function mostrarProductos() {
  let datatable = $('#tablaPrecios').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  let consorcio = $('#consorcio').val();

  db.ref(`consorcios/${consorcio}/productos`).on('value', productos => {
    let filas = '';
    let arrProductos = [];
    productos.forEach(producto => {
      arrProductos.unshift({
        id: producto.key,
        ...producto.val(),
      });
    });

    datatable.clear().draw();
    arrProductos.forEach(producto => {
      const {id, nombre, precioUnitario, precioOferta} = producto;

      filas += `<tr>
                  <td>${consorcio}</td>
                  <td>${id}</td>
                  <td>${nombre}</td>
                  <td>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                      </div>
                      <input type="text" class="form-control" readonly id="precio-${id}" value="${precioUnitario}">
                      <div class="input-group-append">
                        <button class="btn btn-warning" onclick="editar('precio-${id}')" type="button" data-toggle="tooltip" data-placement="top" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-success" onclick="guardarPrecio('precio-${id}', '${id}', '${consorcio}')" type="button" data-toggle="tooltip" data-placement="top" title="Guardar"><i class="fas fa-cloud"></i></button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                      </div>
                      <input type="text" class="form-control" readonly id="precio-oferta-${id}" value="${precioOferta}">
                      <div class="input-group-append">
                        <button class="btn btn-warning" onclick="editar('precio-oferta-${id}')" type="button" data-toggle="tooltip" data-placement="top" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-success" onclick="guardarPrecioOferta('precio-oferta-${id}', '${id}', '${consorcio}')" type="button" data-toggle="tooltip" data-placement="top" title="Guardar"><i class="fas fa-cloud"></i></button>
                      </div>
                    </div>
                  </td>
                </tr>`;
    });
    datatable.rows.add($(filas)).columns.adjust().draw();
    $('[data-toggle="tooltip"]').tooltip()
  });
}

function editar(idInput) {
  $(`#${idInput}`).attr('readonly', false).focus().select();
}

function guardarPrecio(idInput, claveProducto, consorcio) {
  let nuevoPrecio = Number($(`#${idInput}`).val());

  db.ref(`consorcios/${consorcio}/productos/${claveProducto}`).update({
    precioUnitario: nuevoPrecio
  });
  db.ref(`productos/${consorcio}/productos/${claveProducto}`).update({
    precioUnitario: nuevoPrecio
  });

  $(`#${idInput}`).attr('readonly', true);

  $.toaster({ priority: 'success', title: 'Mensaje', message: `El precio se actualizó correctamente` });
}

function guardarPrecioOferta(idInput, claveProducto, consorcio) {
  let nuevoPrecio = Number($(`#${idInput}`).val());

  db.ref(`consorcios/${consorcio}/productos/${claveProducto}`).update({
    precioOferta: nuevoPrecio
  });
  db.ref(`productos/${consorcio}/productos/${claveProducto}`).update({
    precioOferta: nuevoPrecio
  });

  $(`#${idInput}`).attr('readonly', true);

  $.toaster({ priority: 'success', title: 'Mensaje', message: `El precio de oferta se actualizó correctamente` });
}