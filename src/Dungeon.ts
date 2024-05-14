import { BoxGeometry, Mesh, MeshPhongMaterial, NearestFilter, Object3D, PerspectiveCamera, PlaneGeometry, RepeatWrapping, TextureLoader } from 'three';
import { Party } from './Party';
import { TILES } from './constants';
import { Direction } from './directionUtils'

export class Dungeon {
// this.map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        //             [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        //             [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        //             [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        //             [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        //             [0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        //             [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        //             [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        //             [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        //             [0, 0, 1, 1, 1, 0, 1, 2, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        //             [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        //             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0, 1, 2, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    spawn_loc = {x: 3, y: 9};
    
    // spawn_loc = {x: Number(localStorage.getItem('x')), y: Number(localStorage.getItem('y'))};
    spawn_dir = Direction.NORTH;
    constructor(private camera:PerspectiveCamera) {
        
//
    }

        partyCollidesWith(x, y) {
            if (y >= 0 && y < this.map.length) {
                var row = this.map[y];
                if (x >= 0 && x < row.length) {
                    return TILES[row[x]].isSolid;
                }
            }
            return false;
        }

        spawnParty(x,y, spawn_dir) {
            if(x){
                console.log('spawning')
                var self = this;
                return new Party(this.camera, x,
                                 y,
                                 spawn_dir,
                                 function(x, y) {
                                     return self.partyCollidesWith(x, y);
                                 });
            }else {
                console.log('default')

                var self = this;
                return new Party(this.camera, this.spawn_loc.x,
                                 this.spawn_loc.y,
                                 this.spawn_dir,
                                 function(x, y) {
                                     return self.partyCollidesWith(x, y);
                                 });
            }

        }

        addMeshesToScene (scene:Object3D) {
            var texLoader = new TextureLoader();
            var map = this.map

            // texLoader.load('./js/app/portal-3.gif', function (texture) {

            texLoader.load('textures/brick/diffuse.png', function(diffuse) {
                diffuse.magFilter = NearestFilter
                diffuse.minFilter = NearestFilter
                diffuse.wrapS = diffuse.wrapT = RepeatWrapping;
                diffuse.repeat.set(1, 1);
                
                texLoader.load('textures/brick/normal.png', function(normal) {
                    normal.magFilter = NearestFilter
                    normal.minFilter = NearestFilter
                    normal.wrapS = normal.wrapT = RepeatWrapping;
                    normal.repeat.set(1, 1);

                    var material = new MeshPhongMaterial({
                        map: diffuse,
                        normalMap: normal,
                        // shininiess: 1
                    });

                    var basicWallGeom = new BoxGeometry(1, 1, 1);
                    var basicTileGeom = new PlaneGeometry(1, 1, 1);
                    for (var y = 0; y < map.length; y++) {
                        var row = map[y];
                        for (var x = 0; x < row.length; x++) {
                            var type = row[x];

                            if (type == 0) {
                                var mesh = new Mesh(basicWallGeom, material);
                                mesh.castShadow = true;
                                mesh.receiveShadow = true;

                                mesh.position.x = x;
                                mesh.position.y = 0.5;
                                mesh.position.z = y;
                                scene.add(mesh);
                            } 
                            if (type == 1 || type == 2) {
                                var floorMesh = new Mesh(basicTileGeom, material);
                                floorMesh.castShadow = true;
                                floorMesh.receiveShadow = true;

                                floorMesh.position.x = x;
                                floorMesh.position.y = 0;
                                floorMesh.position.z = y;
                                floorMesh.rotation.x = Math.PI*-0.5;
                                scene.add(floorMesh);

                                var ceilMesh = new Mesh(basicTileGeom, material);
                                ceilMesh.castShadow = true;
                                ceilMesh.receiveShadow = true;

                                ceilMesh.position.x = x;
                                ceilMesh.position.y = 1;
                                ceilMesh.position.z = y;
                                ceilMesh.rotation.x = Math.PI*0.5;
                                scene.add(ceilMesh);
                            } 
                        }
                    }
                });
            });
        }
}
