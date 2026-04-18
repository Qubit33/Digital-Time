varying vec3 vNormal;

void main() {

    vec3 dir = vec3(0.0, 0.0, 1.0);

    float dotN = dot(vNormal, dir);

    float intensity = pow(max(0.0, 0.65 - dotN), 3.0);

    vec3 baseColor = vec3(0.1, 0.3, 0.9);

    vec3 edgeColor = vec3(0.4, 0.8, 1.0);

    vec3 col = mix(baseColor, edgeColor, intensity);

    float alpha = intensity * 0.7;

    gl_FragColor = vec4(col, alpha);
}