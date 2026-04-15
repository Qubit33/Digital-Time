varying vec3 vNormal;

void main() {

    // Direção “pólo” local (z = 1)
    vec3 dir = vec3(0.0, 0.0, 1.0);

    // Quanto a normal está “inclinada” em relação ao centro do planeta
    float dotN = dot(vNormal, dir);

    // Intensidade mais suave nas bordas (menos agressivo que 2.0)
    float intensity = pow(max(0.0, 0.65 - dotN), 3.0);

    // Cor base da atmosfera (azul mais profundo)
    vec3 baseColor = vec3(0.1, 0.3, 0.9);

    // Cor da borda (mais clara, céu/auréola)
    vec3 edgeColor = vec3(0.4, 0.8, 1.0);

    // Mistura suave: mais edgeColor nas bordas
    vec3 col = mix(baseColor, edgeColor, intensity);

    // Alpha atenuado para deixar o halo mais natural
    float alpha = intensity * 0.7;

    gl_FragColor = vec4(col, alpha);

}