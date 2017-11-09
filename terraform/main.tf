# lambda function that proceses incoming webhooks from github, verifies signature
# and publishes to sns
resource "aws_lambda_function" "trigger" {
  function_name = "${var.name}"
  description   = "trigger codebuild for github releases"
  role          = "${aws_iam_role.trigger.arn}"
  handler       = "index.handler"
  memory_size   = "${var.memory_size}"
  timeout       = "${var.timeout}"
  runtime       = "nodejs6.10"
  s3_bucket     = "${var.s3_bucket}"
  s3_key        = "${var.s3_key}"

  environment {
    variables = {
      "CONFIG_PARAMETER_NAMES" = "${join(",", compact(list("${var.config_parameter_name}", "${var.additional_parameter_names}")))}"
      "DEBUG"                  = "${var.debug}"
      "NODE_ENV"               = "${var.node_env}"
    }
  }
}

# define terraform managed configuration
resource "aws_ssm_parameter" "configuration" {
  name      = "${var.config_parameter_name}"
  type      = "SecureString"
  value     = "${data.template_file.configuration.rendered}"
  overwrite = true
}

data "template_file" "configuration" {
  template = "${file("${path.module}/configuration.json")}"

  vars {
    sns_topic_arn = "${var.sns_topic_arn}"
  }
}

# subscribe lambda function to gibhub webhook sns topic
resource "aws_sns_topic_subscription" "lambda" {
  topic_arn = "${var.sns_topic_arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.trigger.arn}"
}

# allow sns to invoke trigger function
resource "aws_lambda_permission" "trigger" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.trigger.function_name}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${var.sns_topic_arn}"
}

# include cloudwatch log group resource definition in order to ensure it is
# removed with function removal
resource "aws_cloudwatch_log_group" "trigger" {
  name = "/aws/lambda/${var.name}"
}

# iam role for publish lambda function
resource "aws_iam_role" "trigger" {
  name               = "${var.name}"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role.json}"
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# iam policy for lambda function allowing it to trigger builds for all
# codebuild projects
resource "aws_iam_policy" "trigger" {
  name   = "${var.name}"
  policy = "${data.aws_iam_policy_document.trigger.json}"
}

data "aws_iam_policy_document" "trigger" {
  # allow function to manage codebuild projects and builds
  statement {
    actions = [
      "codebuild:StartBuild",
      "codebuild:StopBuild",
      "codebuild:BatchGetProjects",
    ]

    effect    = "Allow"
    resources = ["*"]
  }

  # allow function to pull configuration from ssm
  statement {
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
    ]

    effect = "Allow"

    resources = [
      "${formatlist("arn:aws:ssm:${var.region}:${data.aws_caller_identity.current.account_id}:parameter%s", split(",", "${var.config_parameter_name},${var.additional_parameter_names}"))}",
    ]
  }

  # allow function to manage cloudwatch logs
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    effect    = "Allow"
    resources = ["*"]
  }
}

# attach trigger policy to trigger role
resource "aws_iam_policy_attachment" "trigger" {
  name       = "${var.name}"
  roles      = ["${aws_iam_role.trigger.name}"]
  policy_arn = "${aws_iam_policy.trigger.arn}"
}
