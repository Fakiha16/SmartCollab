import React from "react";
import "./ClientPanel.css";

export default function ClientPanel() {
  return (
    <div className="empDash">
      <div className="empDash__wrap">
        {/* LEFT: Client Messages */}
        <section className="empCard">
          <div className="empCard__title">Client Messages</div>

          <div className="chatCard__body">
            {/* messages area */}
            <div className="chatMessages">
              <div className="msgRow msgRow--left">
                <div className="avatarRound">
                  <img
                    src="https://i.pravatar.cc/40?img=32"
                    alt=""
                    className="avatarImg"
                    draggable={false}
                  />
                </div>
                <div>
                  <div className="bubble bubble--green">
                    Hey! 📣 Don’t forget our pizza night at your place this Saturday.
                    I’m bringing my famous veggie pizza…
                  </div>
                  <div className="time">3:17 PM</div>
                </div>
              </div>

              <div className="msgRow msgRow--left">
                <div className="avatarRound">
                  <img
                    src="https://i.pravatar.cc/40?img=32"
                    alt=""
                    className="avatarImg"
                    draggable={false}
                  />
                </div>
                <div>
                  <div className="bubble bubble--green">
                    Hey! 📣 Don’t forget our pizza night at your place this Saturday.
                    I’m bringing my famous veggie pizza…
                  </div>
                  <div className="time">3:17 PM</div>
                </div>
              </div>

              <div className="msgRow msgRow--right">
                <div>
                  <div className="bubble bubble--black">
                    Sounds delicious, Meera! 😄 Can’t wait for Saturday! By the way,
                    do you think we should get some ice cream for dessert?
                  </div>
                  <div className="time time--right">3:25 PM</div>
                </div>

                <div className="avatarRound avatarRound--right">
                  <img
                    src="https://i.pravatar.cc/40?img=12"
                    alt=""
                    className="avatarImg"
                    draggable={false}
                  />
                </div>
              </div>

              <div className="msgRow msgRow--left">
                <div className="avatarRound">
                  <img
                    src="https://i.pravatar.cc/40?img=32"
                    alt=""
                    className="avatarImg"
                    draggable={false}
                  />
                </div>
                <div>
                  <div className="bubble bubble--green">
                    Absolutely! 🍦 I’m all in for ice cream. I’ll bring my favorite
                    flavors. What’s your preference?
                  </div>
                  <div className="time">3:37 PM</div>
                </div>
              </div>

              <div className="msgRow msgRow--right">
                <div>
                  <div className="bubble bubble--black">
                    Awesome! 🍨 I love chocolate chip cookie dough. Looking forward
                    to pizza party on friday!!
                  </div>
                  <div className="time time--right">3:28 PM</div>
                </div>

                <div className="avatarRound avatarRound--right">
                  <img
                    src="https://i.pravatar.cc/40?img=12"
                    alt=""
                    className="avatarImg"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* composer */}
            <div className="chatComposer">
              <button className="chatComposer__iconBtn" type="button">
                📎
              </button>

              <input
                className="chatComposer__input"
                placeholder="Type a message"
              />

              <button className="chatComposer__iconBtn" type="button">
                🙂
              </button>

              <button className="chatComposer__sendBtn" type="button">
                ➤
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Shared Document */}
        <section className="empCard">
          <div className="empCard__title">Shared Document</div>

          <div className="docUpload">
            <button className="docUpload__btn" type="button">
              +
            </button>
          </div>

          <div className="docBody">
            <img
              src="https://illustrations.popsy.co/gray/man-working-on-documents.svg"
              alt=""
              className="docImg"
              draggable={false}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
