import * as xstate from 'xstate';
import * as call_service_lib_types from 'call-service/lib/types';
import { CallEvent, CallState } from 'call-service/lib/types';
import EventEmitter from 'eventemitter3';
import { CallService } from 'call-service/lib/callService';

declare namespace AIGateCmd {
    interface Header<T> {
        messageID: string;
        name: T;
    }
    type SubscribeScope = 'Started' | 'SentenceBegin' | 'TranscriptionResultChanged' | 'SentenceEnd' | 'Completed' | 'SkillResult.nlp' | 'SkillResult.quality';
    interface Subscribe {
        header: Header<'Subscribe'>;
        payload: {
            /**
             * @description 当不传scopes字段时，默认需要所有技能
             */
            scopes?: SubscribeScope[];
        };
    }
}
interface SentenceWord {
    word: string;
    startTime: string;
    endTime: string;
}
declare enum SentenceSource {
    Unknown = "unknown",
    Input = "input",
    Output = "output"
}
interface SkillResult {
    content: string;
    scID: number;
    score: number;
    title: string;
}
interface Sentence {
    /**
     * @description 数据来源：unknown, input(麦克风输入，即坐席), output（扬声器输出，即客户），默认为unknown
     */
    source: SentenceSource;
    index: number;
    time: number;
    sentence: string;
    words: SentenceWord[];
}
interface Skill<T> {
    index: number;
    skillResult: T;
}
interface SkillNlp {
    skill: 'nlp';
    result: {
        type: number;
        data: string;
    };
}
interface SkillNlpData {
    queryText: string;
    questionId: number;
    question: string;
    answer: string;
    answerId: number;
    answerType: number;
    recordId: string;
    channelId: string;
    type: string;
    sceneId: string;
    confidence: number;
}
interface SkillQuality {
    skill: 'quality';
    result: [
        {
            idmRuleId: string;
            idmRuleName: string;
            idmWord: string;
            level: string;
            levelId: string;
            index: string;
            voiceId: string;
        }
    ];
}
/**
 * AIGate消息推送格式
 */
declare namespace AIGateMessage {
    type MessageType = 'SentenceBegin' | 'TranscriptionResultChanged' | 'SentenceEnd' | 'SkillResult.nlp' | 'SkillResult.quality' | 'Started' | 'Completed' | 'Failed';
    interface Header<T> {
        sessionID: string;
        voiceID: string;
        messageID: string;
        name: T;
    }
    interface IAIGateMessage<P, T extends MessageType> {
        name: T;
        header: Header<T>;
        payload: P;
    }
    type SentenceBegin = IAIGateMessage<Sentence, 'SentenceBegin'>;
    type TranscriptionResultChanged = IAIGateMessage<Sentence, 'TranscriptionResultChanged'>;
    type SentenceEnd = IAIGateMessage<Sentence, 'SentenceEnd'>;
    type SkillResultNlp = IAIGateMessage<Skill<SkillNlp>, 'SkillResult.nlp'>;
    type SkillResultQuality = IAIGateMessage<Skill<SkillQuality>, 'SkillResult.quality'>;
    type Started = IAIGateMessage<never, 'Started'>;
    type Completed = IAIGateMessage<never, 'Completed'>;
    type Failed = IAIGateMessage<never, 'Failed'>;
}
declare type AIGateMessageUnion = AIGateMessage.SentenceBegin | AIGateMessage.TranscriptionResultChanged | AIGateMessage.SentenceEnd | AIGateMessage.SkillResultNlp | AIGateMessage.SkillResultQuality | AIGateMessage.Started | AIGateMessage.Completed | AIGateMessage.Failed;

declare namespace AssistantService {
    interface InitOptions {
        origin: string;
    }
    interface Passport {
        token: string;
        bizID: string;
    }
    type CallEvent = {
        type: 'onCall';
        customerInfo?: Object;
    } | {
        type: 'onTalkBegin';
    } | {
        type: 'onClosed';
    };
    enum UserType {
        OperationMaster = 0,
        GroupMaster = 1,
        GroupSeat = 2,
        IndividualSeat = 3
    }
    interface UserInfo {
        userId: string;
        username: string;
        type: UserType;
        orgId: string;
        tenantId: number;
    }
    interface Product {
        productCode: string;
        sceneId: number;
        sceneName: string;
    }
    type CallTransitionListener = Parameters<CallService['onTransition']>[0];
    interface Listeners {
        /**
         * @description 监听AI长连接消息推送
         */
        aiMessage: (message: AIGateMessageUnion) => void;
        /**
         * @description 监听通话事件
         */
        callTransition: CallTransitionListener;
    }
}

declare class Assistant extends EventEmitter<AssistantService.Listeners> {
    readonly options: AssistantService.InitOptions;
    private api;
    private userInfo?;
    private passport?;
    private products;
    private productID;
    private clientCnt;
    private aiSocket;
    private accessSocket;
    private callService?;
    constructor(options: AssistantService.InitOptions);
    get origin(): string;
    login: (passport: AssistantService.Passport) => Promise<AssistantService.UserInfo>;
    start(): Promise<{
        products: AssistantService.Product[];
    }>;
    setProductID(productID: number): void;
    startCallService(): void;
    private createAccessSocket;
    private createAIWebsocket;
    send(event: AssistantService.CallEvent): xstate.State<call_service_lib_types.CallContext, CallEvent<unknown>, any, call_service_lib_types.CallTypeState, xstate.TypegenDisabled> | undefined;
    stop(): void;
    logout(): void;
}

declare type ClientResponseCmdType = 'ack' | 'callSummary' | 'kickOff';
declare type ClientCmdType = 'login' | 'logout' | 'onCall' | 'onTalkBegin' | 'onClosed' | 'onDataUpdate' | 'onProductUpdate';
declare namespace ClientMessage {
    interface IRCmd<P, C extends ClientResponseCmdType> {
        cmd: C;
        reqid: string;
        param: P;
    }
    interface IAck {
        code: number;
        msg: string;
        reqcmd: ClientCmdType;
        data?: string;
    }
    type Ack = IRCmd<IAck, 'ack'>;
    interface ICallSummary {
        startTime: string;
        talkBeginTime: string;
        endTime: string;
        param: string;
        data: string;
    }
    type CallSummary = IRCmd<ICallSummary | undefined, 'callSummary'>;
    interface IKickOff {
        newConnID: string;
    }
    type KickOff = IRCmd<IKickOff, 'kickOff'>;
}
declare namespace ClientCmd {
    interface ICmd<P, C extends ClientCmdType> {
        cmd: C;
        reqid?: string;
        param: P;
        data?: string;
        version?: string;
    }
    interface ILogin {
        token: string;
        userID: string;
        userName: string;
        businessID: string;
        version: string;
        crmInitialState?: CallState;
        crmCallID?: string;
        aiServerType?: '0' | '1';
        aiServerURL?: string;
    }
    type Login = ICmd<ILogin, 'login'>;
    interface ILogout {
        userID: string;
    }
    type Logout = ICmd<ILogout, 'logout'>;
    interface IOnCall {
        sessionID: string;
        customerID: string;
        customerName: string;
        productID?: string;
        crmCallID?: string;
        [name: string]: any;
    }
    type OnCall = ICmd<IOnCall, 'onCall'>;
    interface IOnTalkBegin {
        callID?: string;
    }
    type OnTalkBegin = ICmd<IOnTalkBegin, 'onTalkBegin'>;
    interface IOnClosed {
    }
    type OnClosed = ICmd<IOnClosed, 'onClosed'>;
    type IOnDataUpdate = Omit<IOnCall, 'crmCallID'>;
    type OnDataUpdate = ICmd<IOnDataUpdate, 'onDataUpdate'>;
    interface IOnProductUpdate {
    }
    type OnProductUpdate = ICmd<IOnProductUpdate, 'onProductUpdate'>;
}
declare type ClientCmdUnion = ClientCmd.Login | ClientCmd.Logout | ClientCmd.OnCall | ClientCmd.OnTalkBegin | ClientCmd.OnClosed | ClientCmd.OnDataUpdate | ClientCmd.OnProductUpdate;
declare type ClientCallEventCmdUnion = ClientCmd.OnCall | ClientCmd.OnTalkBegin | ClientCmd.OnClosed | ClientCmd.OnDataUpdate;
declare type ClientMessageUnion = ClientMessage.Ack | ClientMessage.KickOff;

export { AIGateCmd, AIGateMessage, type AIGateMessageUnion, AssistantService, type ClientCallEventCmdUnion, ClientCmd, type ClientCmdType, type ClientCmdUnion, ClientMessage, type ClientMessageUnion, type ClientResponseCmdType, type Sentence, SentenceSource, type SentenceWord, type Skill, type SkillNlp, type SkillNlpData, type SkillQuality, type SkillResult, Assistant as default };
