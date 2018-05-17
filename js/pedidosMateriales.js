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

  mostrarPedidosRecibidos();
  mostrarPedidosEntregados();
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
    //si hay un usuario
    if (user) {
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarPedidosRecibidos() {
  db.ref(`pedidosMateriales`).orderByChild('estado').equalTo('Recibido').on('value', snapshot => {
    let pedidos = [];
    snapshot.forEach(pedido => {
      pedidos.unshift({
        id: pedido.key,
        ...pedido.val()
      });
    });

    let datatable = $('#tablaPedidosRecibidos').DataTable({
      data: pedidos,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCaptura',
          render: (fechaCaptura) => {
            moment.locale('es');
            return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
          }
        },
        { data: 'costoTotal' },
        { data: 'consorcio' },
        { data: 'tienda' },
        { 
          data: 'estado',
          className: 'text-center',
          render: (estado) => {
            return `<span class="badge badge-secondary">${estado}</span>`
          }
        },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => { 
            return `<a href="pedidoMaterial.html?id=${id}" class="btn btn-info btn-sm" role="button"><span class="fas fa-eye"></span> Ver más</a>`
          } 
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<button type="button" class="btn btn-success btn-sm" onclick="marcarComoEntregado('${id}')" data-toggle="tooltip" data-placement="top" title="Marcar como entregado"><i class="fas fa-check"></i></button>`
          }
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<button type="button" class="btn btn-danger btn-sm" onclick="eliminarPedido('${id}')"><i class="fas fa-trash-alt" aria-d-none="true"></i></button>`
          }
        }
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });

    $('[data-toggle="tooltip"]').tooltip()
  });
}

function mostrarPedidosEntregados() {
  db.ref(`pedidosMateriales`).orderByChild('estado').equalTo('Entregado').on('value', snapshot => {
    let pedidos = [];
    snapshot.forEach(pedido => {
      pedidos.unshift({
        id: pedido.key,
        ...pedido.val()
      });
    });

    let datatable = $('#tablaPedidosEntregados').DataTable({
      data: pedidos,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCaptura',
          render: (fechaCaptura) => {
            moment.locale('es');
            return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
          }
        },
        { data: 'costoTotal' },
        { data: 'consorcio' },
        { data: 'tienda' },
        { 
          data: 'estado',
          className: 'text-center',
          render: (estado) => {
            return `<span class="badge badge-success">${estado}</span>`;
          }
        },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => { 
            return `<a href="pedidoMaterial.html?id=${id}" class="btn btn-info btn-sm" role="button"><span class="fas fa-eye"></span> Ver más</a>`
          } 
        }
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
  });
}

function eliminarPedido(idPedido) {
  swal({
    title: "¿Está seguro de eliminar este pedido?",
    text: "",
    icon: "warning",
    buttons: true,
    confirm: true,
  })
  .then((will) => {
    if (will) {
      db.ref(`pedidoMateriales`).child(idPedido).remove();

      swal("El pedido se ha eliminado", {
        icon: "success",
      });
    }
  });
}

function marcarComoEntregado(idPedido) {
  swal({
    title: "¿Realmente desea marcar como entregado este pedido?",
    text: "",
    buttons: {
      cancel: true,
      confirm: "Sí",
    },
    confirm: true,
  })
  .then((will) => {
    db.ref(`pedidosMateriales`).child(idPedido).update({
      estado: "Entregado"
    })
    swal("El pedido se ha entregado", {
      icon: "success"
    })
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

function logout() {
  auth.signOut();
}