/// <reference path="./TestUtils.ts"/>
/// <reference path="../typed/qunit.d.ts"/>
/// <reference path="../typed/rx.d.ts"/>
/// <reference path="../typed/rx.testing.d.ts"/>
/// <reference path="../Models/ShaderPlane.ts"/>
/// <reference path="../Models/AudioManager.ts"/>
/// <reference path="../Models/UniformsManager.ts"/>
QUnit.module("audioManger");
test("Plane Geometry Creation", function () {
    var shaderPlane = new ShaderPlane();
    var uniforms = {
        time: { type: "f", value: 0 }
    };
    notEqual(shaderPlane.updateMaterial(new THREE.ShaderMaterial({ uniforms: uniforms })).material, undefined, "material is set");
});
//# sourceMappingURL=planegeometry.tests.js.map