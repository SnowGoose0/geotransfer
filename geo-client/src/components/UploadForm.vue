<script>
import { ref, toRef } from 'vue';

export default {
	props: {
		socket: Object,
		recipient: String,
		selfInfo: Object,
	},

	setup(props) {
		const fileInputElement = ref(null);
    const textInputElement = ref(null);
		const fileList = ref([]);

		const socket = props.socket;
		const recipient = toRef(props, 'recipient');
		const selfInfo = toRef(props, 'selfInfo');

		const sendMessage = () => {
      const messageContent = textInputElement.value.value;

      if (messageContent == "" || messageContent == null) return;
			console.log(recipient)
      socket.emit("send-message", {
        sender: selfInfo.value.id,
        recipient: recipient.value,
        message: messageContent,
      });
      
      textInputElement.value.value = "";
    }

    const sendFiles = () => {
      const file = fileList.value[0];

      if (file == undefined) return;

      socket.emit("send-file", {
        recipient: recipient.value,
        rawFile: file,
      });
    }

    const stageFiles = () => {
      fileList.value = fileInputElement.value.files;
    }

		return {
			sendMessage,
			sendFiles,
			stageFiles,
			fileInputElement,
			textInputElement,
		}
	}
}
</script>

<template>
	<div class="form-container">
		<form @submit.prevent="sendFiles">
			<div class="box" id="file-box">
				<input type="file" ref="fileInputElement" @change="stageFiles" class="input-field file">
				<input type="submit" class="input-button submit-base" id="file-submit" value="Send"> 
			</div>
		</form>

		<form @submit.prevent="sendMessage">
			<div class="box" id="text-box">
				<input type="text" ref="textInputElement" class="input-field text">
				<input type="submit" class="input-button submit-base" id="msg-submit" value="Send">
			</div>
		</form>
	</div>
</template>

<style lang="scss">
	.form-container {
		width: 100%;
		background-color: var(--semi-dark);
		padding: 1rem;
		flex: 1;

		.input-field {
			width: 6rem;
			border-radius: .2rem;
			outline: none;
		}

		.submit-base {
			background-color: var(--light-dark);
			padding: 1rem;
			border-radius: 1rem;
			border: none;
			color: var(--light);
		}

		.box {
			width: 100%;
			padding: .1rem;
			background-color: var(--light-dark);
			border: solid;
			border-radius: .5rem;
			border-color: var(--light-light-dark);
		}

		#file-box {
			margin-bottom: 1rem;

			input[type=file]::-webkit-file-upload-button {
				height: 3.5rem;
				background-color: var(--semi-dark);
				border: none;
				color: var(--light);
				border-radius: .5rem;
				padding: .6rem;
				margin-left: .5rem;
				font-family: var(--fonts);
			}

			input[type=file] {
				width: 70%;
			}

			#file-submit {
				width: 30%;
				height: 5rem;
				border-radius: 0%;
				background-color: var(--semi-dark);
			}
		}

		#text-box {
			input[type=text] {
				height: 3rem;
				width: 70%;
				background-color: var(--light-dark);
				color: var(--light);
				padding-left: .5rem;
				border: 0rem;
			}

			#msg-submit {
				width: 30%;
				height: 3rem;
				border-radius: 0%;
				background-color: var(--semi-dark);
			}
		}
	}
</style>