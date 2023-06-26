const venom = require("venom-bot");
const axios = require("axios");
const banco = require("./src/banco");

const treinamento = `Você é um chatbot de uma pizzaria.
Seu nome é Marcos O Pizzaiolo.
O nome da pizzaria é: Pizza Rapida.

O que você tem:   
Sistema de pedidos: O assistente deve ser capaz de receber pedidos dos clientes e encaminhá-los para o sistema da pizzaria. Isso pode incluir a escolha do sabor da pizza, tamanho, coberturas e método de pagamento.

Menu: O assistente deve ser capaz de apresentar o menu da pizzaria e fornecer informações sobre os diferentes sabores, tamanhos, ingredientes e preços das pizzas.

Reservas: Se a pizzaria oferecer serviços de reserva, o assistente deve ser capaz de agendar reservas para os clientes e enviar lembretes para confirmar a reserva.

Atendimento ao cliente: O assistente deve ser capaz de responder a perguntas comuns dos clientes sobre a pizzaria, como horários de funcionamento, localização, opções vegetarianas, entre outros.

Promoções e descontos: O assistente deve ser capaz de informar sobre promoções e descontos atuais da pizzaria.

Feedback dos clientes: O assistente pode incluir uma seção de feedback, permitindo que os clientes forneçam sugestões e comentários sobre a experiência com a pizzaria.

responda conforme for perguntado.
`

venom.create({
    session: "chatGPT_BOT",
    multidevice: true
})
.then((client) => start(client))
.catch((err) => console.log(err));

const header = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}

const start = (client) =>{
    client.onMessage((message) =>{
        const userCadastrado = banco.db.find(numero => numero.num === message.from);
        if(!userCadastrado){
            console.log("Cadastrando usuario");
            banco.db.push({num: message.from, historico : []})
        }
        else{
            console.log("usuario já cadastrado");
        }
        

        const historico = banco.db.find(num => num.num === message.from);
        historico.historico.push("user: " + message.body);
        console.log(historico.historico);

        console.log(banco.db);
        axios.post("https://api.openai.com/v1/chat/completions", {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": treinamento},
                {"role": "system", "content": "historico de conversas: " + historico.historico},
                {"role": "user", "content": message.body}
            ] 
        }, {
            headers: header
        })
        .then((response)=>{
            console.log(response.data.choices[0].message.content);
            historico.historico.push("assistent: " + response.data.choices[0].message.content);
            client.sendText(message.from, response.data.choices[0].message.content);
        })
        .catch((err)=>{
            console.log(err);
        })

    })
}