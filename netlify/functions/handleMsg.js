exports.handler = async (event, context) => {
    // Mengambil data dari Query String (GET) atau Body (POST)
    const method = event.httpMethod;
    const params = event.queryStringParameters;
    
    // Logika sederhana: Merespons berdasarkan input
    const name = params.name || "Guest";

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: "Halo dari Netlify Functions!",
            method_digunakan: method,
            input_nama: name,
            status: "success"
        }),
    };
};
