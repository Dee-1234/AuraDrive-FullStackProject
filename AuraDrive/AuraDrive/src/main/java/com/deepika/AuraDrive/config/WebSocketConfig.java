package com.deepika.AuraDrive.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix for messages flowing from server to client
        config.enableSimpleBroker("/topic");
        // Prefix for messages flowing from client to server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint where React will connect
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173") // Your React URL
                .withSockJS();
    }
}