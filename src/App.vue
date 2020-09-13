<template>
  <v-app dark>
    <v-app-bar
        absolute
        dark
        app
        color="primary"
        prominent
        :src="require('./assets/background.jpg')"
    >
      <template v-slot:img="{ props }">
        <v-img
            v-bind="props"
        ></v-img>
      </template>
      <v-toolbar-title class="font-weight-bold">Enviar Gemidão do ZAP</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container >
        <v-card>
          <v-card-title>O gemidão do zap</v-card-title>
          <v-card-subtitle>envie o gemidão do zap gratuitamente para o celular dos seus amigos</v-card-subtitle>


          <v-card-text>
            <span class="caption text-lg-justify">
              É simples e fácil, basta preencher o formulario abaixo com o telefone de seu amigo
              que ligaremos a ele, e quando ele atender, dispararemos o gemidão do zap.
            </span>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-row>
              <v-col sm="24" md="6" lg="3">
                <v-text-field
                    outlined
                    v-mask="'(##) #####-####'"
                    v-model="phone"
                    label="Telefone do seu amigo"
                    placeholder="Digite o telefone para ligarmos..."/>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div class="ad-container">
                  <Adsense
                      data-ad-client="ca-pub-4225671400356326"
                      data-ad-slot="8135465187"
                      data-ad-format="auto"
                      :data-full-width-responsive="true"
                  >
                  </Adsense>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn
                large
                block
                color="primary"
                :disabled="!phone.match(/\(\d{2,}\) \d{4,}\-\d{4}/)"
                @click="sendGemidao">Enviar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
    <v-dialog
        v-model="overlay"
        hide-overlay
        persistent
        width="300"
    >
      <v-card
          dark
      >
        <v-card-title>Ligando...</v-card-title>
        <v-card-subtitle>Estamos ligando para {{phone}}, por favor aguarde...</v-card-subtitle>
        <v-card-text class="text-center">
          <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-dialog>
    <audio id="sharp">
      <source :src="require('./assets/sharp.mp3')" type="audio/mp3"/>
      Your browser does not support the audio element.
    </audio>
    <v-footer app>2020 - Todos os direitos reservados</v-footer>

  </v-app>
</template>

<script>

  export default {
    name: 'App',
    data() {
      return {
        phone: "",
        overlay: false
      }
    },
    watch: {},
    created() {
      this.$vuetify.theme.dark = true
      console.log(process.env.NODE_ENV)
    },
    methods: {
      sendGemidao() {
        this.overlay = true;
        setTimeout(() => {
          this.overlay = false
          document.getElementById('sharp').play();
        }, 3000)

      }
    }
  };
</script>
