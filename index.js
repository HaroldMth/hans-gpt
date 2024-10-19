const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Configuration, OpenAIApi } = require('openai');

// Remplacez cette clé par votre propre clé API OpenAI
const openaiApiKey = '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';

// Configuration de l'API OpenAI
const configuration = new Configuration({
    apiKey: openaiApiKey,
});
const openai = new OpenAIApi(configuration);

// Initialisation du client WhatsApp avec stockage local de l'authentification
const client = new Client({
    authStrategy: new LocalAuth() // Sauvegarde l'authentification pour ne pas re-scanner le QR
});

// Générer le QR code dans la console
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scanner le QR code ci-dessus avec WhatsApp pour vous connecter.');
});

// Une fois que le client est prêt
client.on('ready', () => {
    console.log('Le bot Hans GPT est prêt et connecté à WhatsApp !');
});

// Lorsque quelqu'un envoie un message
client.on('message', async message => {
    console.log(Message reçu de ${message.from}: ${message.body});

    // Vérifie si le message commence par .gpt pour activer le mode GPT
    if (message.body.startsWith('.gpt')) {
        const userQuery = message.body.replace('.gpt', '').trim();

        if (userQuery.length === 0) {
            client.sendMessage(message.from, "Veuillez entrer une question après la commande .gpt");
            return;
        }

        try {
            // Envoi du message "HANS GPT" avant la réponse
            client.sendMessage(message.from, 'HANS GPT');

            // Appel à l'API GPT d'OpenAI avec des ajustements pour des réponses plus précises
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",  // Remplacez par gpt-4 si vous avez accès
                messages: [
                    { role: "system", content: "Réponds toujours de manière concise et précise." },
                    { role: "user", content: userQuery }
                ],
                temperature: 0.2,  // Plus la température est basse, plus le modèle sera précis et moins créatif
                max_tokens: 150  // Limite le nombre de tokens pour avoir des réponses courtes et précises
            });

            const gptResponse = response.data.choices[0].message.content;
            client.sendMessage(message.from, gptResponse);  // Envoi de la réponse à l'utilisateur
        } catch (error) {
            console.error('Erreur lors de l\'appel GPT:', error);
            client.sendMessage(message.from, "Erreur lors de la communication avec GPT. Réessayez plus tard.");
        }
    }
});

// Démarrer le client
client.initialize();
