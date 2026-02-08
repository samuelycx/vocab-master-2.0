import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PkService } from './pk.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'pk'
})
export class PkGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly pkService: PkService) { }

    afterInit(server: Server) {
        this.pkService.setServer(server);
    }

    handleConnection(client: Socket) {
        // console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.pkService.handleDisconnect(client);
    }

    @SubscribeMessage('join_queue')
    handleJoinQueue(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { id: string, username: string, avatar: string }
    ) {
        this.pkService.joinQueue(client, data);
    }

    @SubscribeMessage('update_score')
    handleUpdateScore(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { score: number }
    ) {
        this.pkService.handleScore(client, data.score);
    }

    @SubscribeMessage('create_private')
    handleCreatePrivate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { id: string, username: string, avatar: string }
    ) {
        this.pkService.createPrivateMatch(client, data);
    }

    @SubscribeMessage('join_private')
    handleJoinPrivate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { id: string, username: string, avatar: string, inviteCode: string }
    ) {
        this.pkService.joinPrivateMatch(client, data, data.inviteCode);
    }
}
