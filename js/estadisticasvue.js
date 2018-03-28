//  Vue.component('tabla-productos', {
  //template: '#productos2',
   /* template: `<table width="100%" id="tablaProductos" class="table table-condensed table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th class="text-center">Clave</th>
                  <th>Nombre</th>
                  <th>Zona</th>
                  <th>Fecha</th>
                  <th class="text-center">Total Kg</th>
                  <th class="text-center">Total Pz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in listaProductos">
                  <td class="text-center">{{ producto.clave }}</td>
                  <td>{{ producto.nombre }}</td>
                  <td>{{ producto.zona }}</td>
                  <td>{{ producto.fecha }}</td>
                  <td class="text-center">{{ producto.totalKilos }}</td>
                  <td class="text-center">{{ producto.totalPiezas }}</td>
                </tr>
              </tbody>
            </table>
  `,
  props: {
    productos: {
      type: Array
    }
  },
  data() {
    return { */
      //listaProductos: this.productos
    /* }
  },
  computed: {
    listaProductos() {
      return this.productos
    }
  },
  mounted() {  */
    /* $('#tablaProductos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
      destroy: true,
      ordering: false,
      language: LANGUAGE
    }); */
  /* },
  updated() {
    $('#tablaProductos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
    
  }
}) */

new Vue({
  el: '#appProductos',
  data: {
    /* filtro: '',
    zonaPedidos: '',
    fechaInicio: '',
    fechaFin: '',
    pedidos: [],
    peidosFiltrados: [], */

    productos: [],
    productosFiltrados: [],
    clave: '',
    zona: '',
    fecha: '',
    fechaFiltro: '',
    totalKg: 0,
    totalPz: 0,
  },
  computed: {
    strTotalKg() {
      return `Total Kg: ${this.totalKg}`
    },
    strTotalPz() {
      return `Total Pz: ${this.totalPz}`
    }
  },
  created() {
    this.pedidos = JSON.parse(localStorage.getItem('filtrarPedidos'));
    this.productos = JSON.parse(localStorage.getItem('estadisticasProductos'));
    // this.productosFiltrados = this.productos;
  },
  methods: {
    cambiarFecha() {
      let date = this.fecha.split('-');
      this.fechaFiltro = `${date[2]}/${date[1]}/${date[0]}`;
    },
    limpiarBusqueda() {
      this.clave = "";
      this.zona = "";
      this.fecha = "";
      this.totalKg = 0;
      this.totalPz = 0;
      this.productosFiltrados = [];

      let datatable = $('#tablaProductos').DataTable({
        data: this.productosFiltrados,
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
        columns: [
          { data: 'clave', className: 'text-center' },
          { data: 'nombre', defaultContent: "" },
          { data: 'zona', className: 'text-center' },
          {
            data: 'fecha',
            render: (fecha) => {
              moment.locale('es');
              return moment(`${fecha.substr(3,2)}/${fecha.substr(0,2)}/${fecha.substr(6,4)}`).format('LL')
            }
          },
          { data: 'totalKilos', className: 'text-center', defaultContent: "" },
          { data: 'totalPiezas', className: 'text-center', defaultContent: "" }
        ],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
    },
    filtrar() {
      let filtro = [];
      this.totalKg = 0;
      this.totalPz = 0;

      if(this.clave != '' && this.zona != '' && this.fecha != '') {
        this.productos.map((producto) => {
          if(producto.clave === this.clave && producto.zona === this.zona && producto.fecha === this.fechaFiltro) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else if(this.clave != '' && this.zona != '' && this.fecha == '') {
        this.productos.map((producto) => {
          if(producto.clave === this.clave && producto.zona === this.zona) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else if(this.clave != '' && this.zona == '' && this.fecha != '') {
        this.productos.map((producto) => {
          if(producto.clave === this.clave && producto.fecha === this.fechaFiltro) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else if(this.clave == '' && this.zona != '' && this.fecha != '') {
        this.productos.map((producto) => {
          if(producto.zona === this.zona && producto.fecha === this.fechaFiltro) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else if(this.clave != '' && this.zona == '' && this.fecha == '') {
        this.productos.map((producto) => {
          if(producto.clave === this.clave) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else if(this.clave == '' && this.zona != '' && this.fecha == '') {
        this.productos.map((producto) => {
          if(producto.zona === this.zona) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else if(this.clave == '' && this.zona == '' && this.fecha != '') {
        this.productos.map((producto) => {
          if(producto.fecha === this.fechaFiltro) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else {
        this.totalKg = 0;
        this.totalPz = 0;
      }
      //this.data = this.productosFiltrados;
      this.totalKg = Number(this.totalKg.toFixed(4));
      //this.total = this.productosFiltrados.length;

      let datatable = $('#tablaProductos').DataTable({
        data: this.productosFiltrados,
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
        columns: [
          { data: 'clave', className: 'text-center' },
          { data: 'nombre', defaultContent: "" },
          { data: 'zona', className: 'text-center' },
          {
            data: 'fecha',
            render: (fecha) => {
              moment.locale('es');
              return moment(`${fecha.substr(3,2)}/${fecha.substr(0,2)}/${fecha.substr(6,4)}`).format('LL')
            }
          },
          { data: 'totalKilos', className: 'text-center', defaultContent: "" },
          { data: 'totalPiezas', className: 'text-center', defaultContent: "" }
        ],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
    }
  }
})