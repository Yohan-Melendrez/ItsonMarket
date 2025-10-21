const publicacionesDummy = require('../data/publicacionesDummy.json');
let nextId = 6;

class PublicacionRepository {

    async obtenerPublicaciones() {
        await new Promise(resolve => setTimeout(resolve, 100));
        return publicacionesDummy.filter(pub => pub.visible);
    }

   
    async crearPublicacion(data) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const nuevaPublicacion = {
            id: nextId.toString(),
            ...data,
            estado: data.estado || "disponible",
            visible: true,
            vistas: 0,
            fecha_publicacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        publicacionesDummy.push(nuevaPublicacion);
        nextId++;
        return nuevaPublicacion;
    }

  
    async obtenerPublicacionPorId(id) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const publicacion = publicacionesDummy.find(pub => 
            pub.id === id && pub.visible
        );
        
        if (publicacion) {
            publicacion.vistas += 1;
        }
        return publicacion || null;
    }


    async actualizarPublicacion(id, data) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const index = publicacionesDummy.findIndex(pub => pub.id === id);
        
        if (index === -1) {
            return null;
        }

        const publicacionActualizada = {
            ...publicacionesDummy[index],
            ...data,
            fecha_actualizacion: new Date().toISOString()
        };

        publicacionesDummy[index] = publicacionActualizada;
        return publicacionActualizada;
    }

    async eliminarPublicacion(id) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const index = publicacionesDummy.findIndex(pub => pub.id === id);
        
        if (index === -1) {
            return null;
        }

        publicacionesDummy[index].visible = false;
        publicacionesDummy[index].estado = "eliminado";
        publicacionesDummy[index].fecha_actualizacion = new Date().toISOString();

        return { eliminado: true, id: id };
    }
}

module.exports = { PublicacionRepository };
