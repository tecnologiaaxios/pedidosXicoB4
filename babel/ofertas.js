'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var db = firebase.database();
var auth = firebase.auth();
var productos = [];

var LANGUAGE = {
  searchPlaceholder: "Buscar",
  sProcessing: 'Procesando...',
  sLengthMenu: 'Mostrar _MENU_ registros',
  sZeroRecords: 'No se encontraron resultados',
  sEmptyTable: 'Ningún dato disponible en esta tabla',
  sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
  sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
  sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
  sInfoPostFix: '',
  sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
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

  $('#formatos').multiselect({
    buttonClass: 'form-control',
    nonSelectedText: 'Seleccionar',
    buttonContainer: '<div class="btn-group" />',
    buttonWidth: '100%'
  });

  $('#tiendas').multiselect({
    buttonClass: 'form-control',
    nonSelectedText: 'Seleccionar',
    buttonContainer: '<div class="btn-group" />',
    buttonWidth: '100%'
  });

  llenarSelectConsorcio();
  mostrarOfertasActivas();
  mostrarOfertasInactivas();
});

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

/* function llenarSelectZona() {
  db.ref('regiones').once('value', regiones => {
    let zonas = regiones.val();

    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (let zona in zonas) {
      options += `<option value="${zona}">${zona}</option>`;
    }

    $('#zona').html(options);
  });
} */

function llenarSelectConsorcio() {
  db.ref('consorcios').once('value', function (productos) {
    var consorcios = productos.val();
    // $('#consorcio').multiselect('destroy');
    var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    /* let options = ""; */
    for (var consorcio in consorcios) {
      options += '<option value="' + consorcio + '">' + consorcio + '</option>';
    }

    $('#consorcio').html(options);
    /* $('#consorcio').multiselect({
      buttonClass: 'form-control',
      includeSelectAllOption: true,
      buttonContainer: '<div class="btn-group" />',
      inheritClass: true,
      selectAllText: 'Seleccionar todo',
      nonSelectedText: 'Seleccionar',
      buttonWidth: '100%', 
    }); */
  });
}

$('#consorcio').change(function () {
  var consorcio = $(this).val();
  llenarSelectFormatos(consorcio);
  llenarSelectProducto(consorcio);
});

function llenarSelectFormatos(consorcio) {
  if (consorcio != null && consorcio != undefined) {
    db.ref('consorcios/' + consorcio + '/').once('value', function (snapshot) {
      var formatos = snapshot.val().formatos;
      if (formatos.length > 0) {
        var options = '';
        $('#formatos').multiselect('destroy');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = formatos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var formato = _step.value;

            options += '<option value="' + formato + '">' + formato + '</option>';
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        $('#formatos').html(options);

        $('#formatos').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%'
        });
      } else {
        $('#formatos').multiselect('destroy').html('');
        $('#formatos').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%'
        });
        llenarSelectTiendas(formatos);
      }
    });
  }
}

$('#formatos').change(function () {
  var formatos = $(this).val();
  llenarSelectTiendas(formatos);
});

function llenarSelectTiendas(formatos) {
  var consorcio = $('#consorcio').val();
  if (consorcio != null && consorcio != undefined && formatos.length > 0) {
    db.ref('consorcios/' + consorcio + '/tiendas').once('value', function (snapshot) {
      var tiendas = snapshot.val();
      var options = '';

      $('#tiendas').multiselect('destroy');
      for (var tienda in tiendas) {
        if (formatos.includes(tiendas[tienda].formato)) {
          var nombreTienda = tiendas[tienda].nombre;
          options += '<option value="' + nombreTienda + '">' + nombreTienda + '</option>';
        }
      }
      $('#tiendas').html(options);

      $('#tiendas').multiselect({
        buttonClass: 'form-control',
        includeSelectAllOption: true,
        buttonContainer: '<div class="btn-group" />',
        inheritClass: true,
        selectAllText: 'Seleccionar todo',
        nonSelectedText: 'Seleccionar',
        buttonWidth: '100%'
      });
    });
  } else if (consorcio != null && consorcio != undefined) {
    db.ref('consorcios/' + consorcio + '/tiendas').once('value', function (snapshot) {
      var tiendas = snapshot.val();
      var options = '';

      $('#tiendas').multiselect('destroy');
      for (var tienda in tiendas) {
        var nombreTienda = tiendas[tienda].nombre;
        options += '<option value="' + nombreTienda + '">' + nombreTienda + '</option>';
      }
      $('#tiendas').html(options);

      $('#tiendas').multiselect({
        buttonClass: 'form-control',
        includeSelectAllOption: true,
        buttonContainer: '<div class="btn-group" />',
        inheritClass: true,
        selectAllText: 'Seleccionar todo',
        nonSelectedText: 'Seleccionar',
        buttonWidth: '100%',
        selectedClass: 'multiselect-selected'
      });
    });
  }
}

/* function llenarSelectTienda(consorcio) {
  db.ref('tiendas').orderByChild('consorcio').equalTo(consorcio).once('value', snapshot => {
    let tiendas = snapshot.val();

    let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
    for(let tienda in tiendas) {
      let nombreTienda = tiendas[tienda].nombre
      options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
    }
    $('#tienda').html(options);
  });
} */

/* Vue.use(VueFire);

new Vue({
  el: '#app',
  data: {
    consorcio: 'Seleccionar',
    formatos: [],
    tienda: 'Seleccionar',
    producto: 'Seleccionar',
    precioLista: 0,
    precioOferta: 0,
    fechaInicio: '',
    fechaFin: '',
    productos: []
  },
  computed: {
    fechaInicioFormateada() {
      let fecha = this.fechaInicio.split('-');
      return `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
    },
    fechaFinFormateada() {
      let fecha = this.fechaFin.split('-');
      return `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
    }
  },
  firebase: {
    consorcios: db.ref('consorcios')
  },
  methods: {
    llenarSelectFormatos() {
      db.ref(`consorcios/${this.consorcio}/`).once('value', snapshot => {
        let formatos = snapshot.val().formatos;
        let options = ``;
    
        $('#formatos').multiselect('destroy');
        for(let formato of formatos) {
          options += `<option value="${formato}">${formato}</option>`;
        }
        $('#formatos').html(options);
        
        $('#formatos').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%',
          
        });
      });
    },
    llenarSelectTiendas() {
      db.ref(`consorcios/${this.consorcio}/tiendas`).once('value', snapshot => {
        let tiendas = snapshot.val();
        
        console.log("Entro al metodo")
        let options = ``;
        for(let tienda in tiendas) {
          if(this.formatos.includes(tiendas[tienda].formato)) {
            let nombreTienda = tiendas[tienda].nombre

            console.log("El formato esta dentro")
            options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
          }
        }
        
        $('#tienda').html(options);
        $('#tiendas').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%',
          
        });
      });
    },
    limpiarCampos() {
      this.producto = "Seleccionar",
      this.precioOferta = 0,
      this.fechaInicio = "",
      this.fechaFin = ""
    },
    agregarProducto() {
      if(this.producto != 'Seleccionar' && this.precioOferta > 0 && this.fechaInicio != '' && this.fechaFin != '') {
        db.ref('listadoProductos').child(this.producto).once('value', snapshot => {
          let datos = snapshot.val();

          let producto = {
            clave: this.producto,
            nombre: datos.nombre,
            precioLista: datos.precioUnitario,
            precioOferta: Number(this.precioOferta),
            fechaInicio: this.fechaInicioFormateada,
            fechaFin: this.fechaFinFormateada
          }
          this.productos.push(producto);
          this.limpiarCampos();
        });
      }
    },
    guardarOferta() {
      if(this.consorcio != "Seleccionar" && this.productos.length > 0) {
        swal({
          title: "¿Está seguro de crear esta oferta?",
          text: "",
          icon: "info",
          buttons: true,
          confirm: true,
        })
        .then((will) => {
          if (will) {
            db.ref('ofertas').once('value', snapshot => {
              let ofertas = snapshot.val();
              if(ofertas != undefined) {
                let keys = Object.keys(ofertas),
                last = keys[keys.length - 1],
                ultimaOferta = ofertas[last],
                lastclave = ultimaOferta.clave,
                clave = lastclave + 1;
                
                if(this.tienda == "Seleccionar") {
                  db.ref('ofertas').push({
                    activa: true,
                    clave,
                    consorcio: this.consorcio,
                    tienda: '',
                    productos: this.productos   
                  });
                }
                else {
                  db.ref('ofertas').push({
                    activa: true,
                    clave,
                    consorcio: this.consorcio,
                    tienda: this.tienda,
                    productos: this.productos
                  });
                }
              }
              else {
                if(this.tienda == "Seleccionar") {
                  db.ref('ofertas').push({
                    clave: 1,
                    consorcio: this.consorcio,
                    tienda: '',
                    productos: this.productos
                  });
                }
                else {
                  db.ref('ofertas').push({
                    clave: 1,
                    consorcio: this.consorcio,
                    tienda: this.tienda,
                    productos: this.productos
                  });
                }
              }
            
              this.consorcio = "Seleccionar";
              this.tienda = "Seleccionar",
              this.productos = [];
              this.limpiarCampos();
            }); 
            
            swal("La oferta se ha dado de alta", {
              icon: "success",
            });
          }
        });
      }
    }
  }
}); */

function llenarSelectProducto(consorcio) {
  if (consorcio != null && consorcio != undefined) {
    db.ref('consorcios/' + consorcio + '/productos').once('value', function (snapshot) {
      var productos = snapshot.val();
      var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
      for (var producto in productos) {
        options += '<option value="' + producto + '">' + producto + ' - ' + productos[producto].nombre + '</option>';
      }

      $('#producto').html(options);
      /* $('#producto').multiselect({
        buttonClass: 'form-control',
        includeSelectAllOption: true,
        buttonContainer: '<div class="btn-group" />',
        inheritClass: true,
        selectAllText: 'Seleccionar todo',
        nonSelectedText: 'Seleccionar',
        buttonWidth: '100%', 
      }); */
    });
  }
}

function agregarProducto() {
  var consorcio = $('#consorcio').val(),
      claveProducto = $('#producto').val(),
      precioOferta = $('#precioOferta').val();

  if (consorcio != undefined && consorcio != null && claveProducto != 'Seleccionar' && claveProducto != null && claveProducto != undefined && precioOferta > 0) {
    db.ref('consorcios/' + consorcio + '/productos').child(claveProducto).once('value', function (snapshot) {
      var datos = snapshot.val();

      var producto = {
        clave: claveProducto,
        nombre: datos.nombre,
        precioLista: datos.precioUnitario,
        precioOferta: Number(precioOferta)
      };
      productos.push(producto);
      limpiarCampos();

      var fila = '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.precioLista + '</td>\n                    <td>' + producto.precioOferta + '</td>\n                  </tr>';
      $('#productos tbody').append(fila);
    });
  }
}

function limpiarCampos() {
  $('#producto').val('Seleccionar');
  $('#precioOferta').val('');
}

function guardarOferta() {
  var consorcio = $('#consorcio').val(),
      formatos = $('#formatos').val(),
      tiendas = $('#tiendas').val(),
      fechaInicio = $('#fechaInicio').val(),
      fechaFin = $('#fechaFin').val();

  if (consorcio != undefined && consorcio != null && tiendas.length > 0 && fechaInicio.length > 0 && fechaFin.length > 0) {
    if (formatos.length == 0) {
      formatos = "";
    }

    swal({
      title: "¿Está seguro de crear esta oferta?",
      text: "",
      icon: "info",
      buttons: true,
      confirm: true
    }).then(function (will) {
      if (will) {
        db.ref('ofertas').once('value', function (snapshot) {
          var ofertas = snapshot.val();
          if (ofertas != undefined) {
            var keys = Object.keys(ofertas),
                last = keys[keys.length - 1],
                ultimaOferta = ofertas[last],
                lastclave = ultimaOferta.clave,
                clave = lastclave + 1;

            db.ref('ofertas').push({
              activa: true,
              clave: clave,
              consorcio: consorcio,
              formatos: formatos,
              tiendas: tiendas,
              productos: productos,
              fechaInicio: fechaInicio,
              fechaFin: fechaFin
            });
          } else {
            db.ref('ofertas').push({
              activa: true,
              clave: 1,
              consorcio: consorcio,
              formatos: formatos,
              tiendas: tiendas,
              productos: productos,
              fechaInicio: fechaInicio,
              fechaFin: fechaFin
            });
          }

          $('#consorcio').val('Seleccionar');
          $('option', $('#formatos')).each(function (element) {
            $(this).removeAttr('selected').prop('selected', false);
          });
          $('#formatos').multiselect('refresh');
          $('option', $('#tiendas')).each(function (element) {
            $(this).removeAttr('selected').prop('selected', false);
          });
          $('#tiendas').multiselect('refresh');
          $('#fechaInicio').val('');
          $('#fechaFin').val('');
          productos = [];
          $('#productos tbody').html('');
          limpiarCampos();

          swal("La oferta se ha dado de alta", {
            icon: "success"
          });
        });
      }
    });
  }
}

function mostrarOfertasActivas() {
  var datatable = $('#tablaOfertasActivas').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  db.ref('ofertas').orderByChild('activa').equalTo(true).on('value', function (ofertas) {

    var filas = "";
    var arrOfertas = [];
    ofertas.forEach(function (oferta) {
      arrOfertas.unshift(_extends({
        key: oferta.key
      }, oferta.val()));
    });

    arrOfertas.forEach(function (oferta) {
      // let datosOferta = oferta;

      datatable.clear().draw();
      filas += '<tr>\n                  <td>' + oferta.key + '</td>\n                  <td>' + oferta.clave + '</td>\n                  <td>' + oferta.consorcio + '</td>\n                  <td>' + oferta.tiendas.join(', ') + '</td>\n                  <td class="text-center"><span class="badge badge-danger lead">' + oferta.productos.length + '</span></td>\n                  <td>' + oferta.fechaInicio + '</td>\n                  <td>' + oferta.fechaFin + '</td>\n                  <td class="text-center"><a href="oferta.html?id=' + oferta.key + '" role="button" class="card-link btn btn-xs btn-outline-info"><span class="fas fa-eye"></span> Ver oferta</a></td>\n                  <td class="text-center"><button type="button" onclick="finalizarOferta(\'' + oferta.key + '\')" class="btn btn-xs btn-outline-success"><span class="fas fa-hourglass-end"></span> Finalizar</button></td>\n                </tr>';
    });

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarOfertasInactivas() {
  var datatable = $('#tablaOfertasInactivas').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  db.ref('ofertas').orderByChild('activa').equalTo(false).on('value', function (ofertas) {

    var filas = "";

    var arrOfertas = [];
    ofertas.forEach(function (oferta) {
      arrOfertas.unshift(_extends({
        key: oferta.key
      }, oferta.val()));
    });

    arrOfertas.forEach(function (oferta) {
      // let datosOferta = oferta.val();

      datatable.clear().draw();

      filas += '<tr>\n                  <td>' + oferta.key + '</td>\n                  <td>' + oferta.clave + '</td>\n                  <td>' + oferta.consorcio + '</td>\n                  <td>' + oferta.tiendas.join(', ') + '</td>\n                  <td class="text-center"><span class="badge badge-danger lead">' + oferta.productos.length + '</span></td>\n                  <td>' + oferta.fechaInicio + '</td>\n                  <td>' + oferta.fechaFin + '</td>\n                  <td class="text-center"><a href="oferta.html?id=' + oferta.key + '" role="button" class="card-link btn btn-xs btn-outline-success"><span class="fas fa-eye"></span> Ver oferta</a></td>\n                </tr>';
    });

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function finalizarOferta(idOferta) {
  swal({
    title: "¿Está seguro de finalizar esta oferta?",
    text: "",
    icon: "info",
    buttons: true,
    confirm: true
  }).then(function (will) {
    if (will) {
      db.ref('oferta/' + idOferta).update({
        activa: false
      });

      swal("La oferta se ha finalizado", {
        icon: "success"
      });
    }
  });
}

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>\n                <a>\n                  <div>\n                    <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                    <span class="pull-right text-muted small">' + fecha + '</span>\n                  </div>\n                </a>\n              </li>';
    }
    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
  });
}

// todas las que no sean division que sean tiendas
// por ejemplo hiper y super (soriana)
// poner el tipo de clasificacion


function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}