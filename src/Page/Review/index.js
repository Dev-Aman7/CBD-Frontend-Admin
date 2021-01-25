import React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import * as actionCreators from "../../store/actions/review";
import cogoToast from "cogo-toast";
import { useState } from "react";
import { Spinner } from "react-bootstrap";
import Table from "../../App/components/CategoryTable";
import { Button } from "antd";
import "antd/dist/antd.css";
import { useRef } from "react";
import { ExportCSV } from "../../App/components/ExportCsv";
import ReactToPdf from "react-to-pdf";
import ReactToPrint from "react-to-print";

const Review = ({ reviews, get, deletee, edit }) => {
  console.log(reviews);
  const [loading, setLoading] = useState(true);
  const ref = useRef();
  const ref1 = useRef();
  const [pdf, setPdf] = useState(true);
  const options = {
    orientation: "landscape",
    unit: "in",
    format: [595.28, 841.89],
    compress: true,
  };
  useEffect(() => {
    get()
      .then((result) => {
        setLoading(false);
        cogoToast.success(result);
      })
      .catch((err) => {
        setLoading(false);
        cogoToast.error(err);
      });
  }, [get]);

  const removeReview = (id) => {
    setLoading(true);
    deletee(id)
      .then((result) => {
        setLoading(false);
        cogoToast.success(result);
      })
      .catch((err) => {
        setLoading(false);
        cogoToast.error(err);
      });
  };

  const editReview = (id) => {
    setLoading(true);
    edit(id)
      .then((result) => {
        setLoading(false);
        cogoToast.success(result);
      })
      .catch((err) => {
        setLoading(false);
        cogoToast.error(err);
      });
  };
  return loading ? (
    <div>
      <Spinner
        animation="border"
        style={{ position: "fixed", top: "20%", left: "60%" }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  ) : (
    <div>
      <ExportCSV
        csvData={reviews.map((item) => {
          return {
            Title: item.title,
            Content: item.content,
            Email: item.userid ? item.userid.email : "",
          };
        })}
        fileName="All Reviews"
      />
      <ReactToPdf
        x={0}
        y={0}
        scale={1}
        onComplete={() => setPdf(true)}
        options={options}
        targetRef={ref1}
        filename="All Reviews.pdf"
      >
        {({ toPdf }) => (
          <Button
            style={{ marginRight: "20px" }}
            type="primary"
            onClick={async () => {
              setPdf(false);
              setTimeout(toPdf, 500);
            }}
          >
            PDF
          </Button>
        )}
      </ReactToPdf>
      <ReactToPrint
        onBeforeGetContent={() => setPdf(false)}
        onAfterPrint={() => setPdf(true)}
        trigger={() => {
          // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
          // to the root node of the returned component as it will be overwritten.
          return <Button type="primary">PRINT</Button>;
        }}
        content={() => ref.current}
      />
      <div ref={ref1}>
        <Table
          onEdit={editReview}
          onDelete={removeReview}
          data={reviews.map((review) => {
            return {
              title: review.title,
              content: review.content,
              email: review.userid ? review.userid.email : "",
            };
          })}
          setPdf={pdf}
          ref={ref}
          columns={["title", "content", "email"]}
          titles={["Title", "Content", "Email"]}
          type="review"
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    reviews: state.reviewReducer.data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    get: () => dispatch(actionCreators.getReviews()),
    edit: (id) => dispatch(actionCreators.editReview(id)),
    deletee: (id) => dispatch(actionCreators.deleteReview(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Review);
